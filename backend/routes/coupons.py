from flask import Blueprint, request, jsonify
import psycopg2.extras
from datetime import datetime, timezone
from db import get_db_connection
from utils.auth import token_required

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/coupons/available', methods=['GET'])
@token_required
def get_available_coupons(current_user):
    """Get all available active coupons"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get active coupons that haven't expired and still have usage left
        cur.execute("""
            SELECT 
                coupon_id, code, discount_type, discount_value,
                min_order_value, max_discount, valid_from, valid_to,
                is_active, usage_limit, used_count, description
            FROM app.coupons
            WHERE is_active = TRUE
            AND valid_to > NOW()
            AND (usage_limit IS NULL OR used_count < usage_limit)
            ORDER BY discount_value DESC, valid_to ASC;
        """)
        
        coupons = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({"ok": True, "coupons": coupons}), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@coupons_bp.route('/coupons/validate', methods=['POST'])
@token_required
def validate_coupon(current_user):
    """Validate a coupon code for an order amount"""
    try:
        data = request.get_json()
        code = data.get('code', '').strip().upper()
        order_amount = float(data.get('order_amount', 0))
        
        if not code or order_amount <= 0:
            return jsonify({"ok": False, "error": "Invalid input"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get coupon details
        cur.execute("""
            SELECT * FROM app.coupons
            WHERE code = %s AND is_active = TRUE;
        """, (code,))
        
        coupon = cur.fetchone()
        
        if not coupon:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "valid": False, "message": "Invalid or inactive coupon code"}), 200
        
        # Get current time (timezone-naive to match database)
        now = datetime.now()
        valid_to = coupon['valid_to'].replace(tzinfo=None) if coupon['valid_to'].tzinfo else coupon['valid_to']
        valid_from = coupon['valid_from'].replace(tzinfo=None) if coupon['valid_from'].tzinfo else coupon['valid_from']
        
        # Check if expired
        if now > valid_to:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "valid": False, "message": "Coupon has expired"}), 200
        
        # Check if not yet valid
        if now < valid_from:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "valid": False, "message": "Coupon is not yet valid"}), 200
        
        # Check usage limit
        if coupon['usage_limit'] and coupon['used_count'] >= coupon['usage_limit']:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "valid": False, "message": "Coupon usage limit reached"}), 200
        
        # Check minimum order value
        if order_amount < (coupon['min_order_value'] or 0):
            cur.close()
            conn.close()
            return jsonify({
                "ok": False, 
                "valid": False, 
                "message": f"Minimum order value is {coupon['min_order_value']:,.0f}₫"
            }), 200
        
        # Calculate discount
        if coupon['discount_type'] == 'percentage':
            discount = (order_amount * coupon['discount_value']) / 100
            if coupon['max_discount']:
                discount = min(discount, float(coupon['max_discount']))
        else:  # fixed
            discount = float(coupon['discount_value'])
        
        cur.close()
        conn.close()
        
        return jsonify({
            "ok": True,
            "valid": True,
            "discount": discount,
            "final_amount": order_amount - discount,
            "message": "Coupon is valid"
        }), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@coupons_bp.route('/orders/<int:order_id>/apply-coupon', methods=['POST'])
@token_required
def apply_coupon_to_order(current_user, order_id):
    """Apply a coupon to an existing order"""
    try:
        data = request.get_json()
        code = data.get('coupon_code', '').strip().upper()
        
        if not code:
            return jsonify({"ok": False, "error": "Coupon code required"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get order
        cur.execute("""
            SELECT * FROM app.orders WHERE order_id = %s;
        """, (order_id,))
        order = cur.fetchone()
        
        if not order:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Order not found"}), 404
        
        # Check if user owns the order
        if order['customer_id'] != current_user['user_id']:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Unauthorized"}), 403
        
        # Get coupon
        cur.execute("""
            SELECT * FROM app.coupons
            WHERE code = %s AND is_active = TRUE;
        """, (code,))
        coupon = cur.fetchone()
        
        if not coupon:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Invalid coupon code"}), 400
        
        # Validate coupon (same checks as above)
        now = datetime.now()
        if now > coupon['valid_to']:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Coupon has expired"}), 400
        
        if now < coupon['valid_from']:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Coupon is not yet valid"}), 400
        
        if coupon['usage_limit'] and coupon['used_count'] >= coupon['usage_limit']:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Coupon usage limit reached"}), 400
        
        order_amount = float(order['price_estimate'] or 0)
        
        if order_amount < (coupon['min_order_value'] or 0):
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": f"Minimum order value is {coupon['min_order_value']:,.0f}₫"}), 400
        
        # Calculate discount
        if coupon['discount_type'] == 'percentage':
            discount = (order_amount * coupon['discount_value']) / 100
            if coupon['max_discount']:
                discount = min(discount, float(coupon['max_discount']))
        else:
            discount = float(coupon['discount_value'])
        
        final_amount = order_amount - discount
        
        # Update order with coupon
        cur.execute("""
            UPDATE app.orders
            SET price_estimate = %s
            WHERE order_id = %s;
        """, (final_amount, order_id))
        
        # Record coupon usage
        cur.execute("""
            INSERT INTO app.user_coupons (user_id, coupon_id, order_id, discount_amount)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, coupon_id, order_id) DO NOTHING;
        """, (current_user['user_id'], coupon['coupon_id'], order_id, discount))
        
        # Increment coupon used_count
        cur.execute("""
            UPDATE app.coupons
            SET used_count = used_count + 1
            WHERE coupon_id = %s;
        """, (coupon['coupon_id'],))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "ok": True,
            "message": "Coupon applied successfully",
            "original_amount": order_amount,
            "discount": discount,
            "final_amount": final_amount
        }), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@coupons_bp.route('/user/coupons', methods=['GET'])
@token_required
def get_user_coupons(current_user):
    """Get coupons used by current user"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT 
                uc.user_coupon_id,
                uc.order_id,
                uc.discount_amount,
                uc.used_at,
                c.code,
                c.discount_type,
                c.discount_value,
                c.description
            FROM app.user_coupons uc
            JOIN app.coupons c ON uc.coupon_id = c.coupon_id
            WHERE uc.user_id = %s
            ORDER BY uc.used_at DESC;
        """, (current_user['user_id'],))
        
        coupons = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({"ok": True, "coupons": coupons}), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
