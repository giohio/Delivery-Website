from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.auth import token_required

role_switch_bp = Blueprint('role_switch', __name__, url_prefix='/api/roles')

@role_switch_bp.route('/available', methods=['GET'])
@token_required
def get_available_roles(current_user):
    """Get all roles available for current user (only approved roles)"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                ur.role_id,
                ur.is_active,
                ur.approved_at,
                CASE 
                    WHEN ur.role_id = 1 THEN 'Admin'
                    WHEN ur.role_id = 2 THEN 'Merchant'
                    WHEN ur.role_id = 3 THEN 'Shipper'
                    WHEN ur.role_id = 4 THEN 'Customer'
                END as role_name
            FROM app.user_roles ur
            WHERE ur.user_id = %s 
            AND ur.is_active = TRUE 
            AND ur.approved_at IS NOT NULL
            ORDER BY ur.role_id
        """, (current_user['user_id'],))
        
        roles = []
        for row in cur.fetchall():
            roles.append({
                'role_id': row[0],
                'is_active': row[1],
                'approved_at': row[2].isoformat() if row[2] else None,
                'role_name': row[3]
            })
        
        # Get current active role
        cur.execute("""
            SELECT current_role_id FROM app.users WHERE user_id = %s
        """, (current_user['user_id'],))
        
        current_role = cur.fetchone()
        
        return jsonify({
            'roles': roles,
            'current_role_id': current_role[0] if current_role else 4
        }), 200
        
    except Exception as e:
        print(f"Error getting roles: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@role_switch_bp.route('/switch', methods=['POST'])
@token_required
def switch_role(current_user):
    """Switch to a different role"""
    try:
        data = request.get_json()
        new_role_id = data.get('role_id')
        
        if not new_role_id:
            return jsonify({'error': 'role_id is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user has this role and it's approved
        cur.execute("""
            SELECT user_role_id FROM app.user_roles
            WHERE user_id = %s 
            AND role_id = %s 
            AND is_active = TRUE
            AND approved_at IS NOT NULL
        """, (current_user['user_id'], new_role_id))
        
        if not cur.fetchone():
            return jsonify({'error': 'You do not have access to this role'}), 403
        
        # Update current role
        cur.execute("""
            UPDATE app.users 
            SET current_role_id = %s 
            WHERE user_id = %s
        """, (new_role_id, current_user['user_id']))
        
        conn.commit()
        
        role_names = {1: 'Admin', 2: 'Merchant', 3: 'Shipper', 4: 'Customer'}
        
        return jsonify({
            'message': f'Switched to {role_names.get(new_role_id, "Unknown")} role',
            'current_role_id': new_role_id
        }), 200
        
    except Exception as e:
        print(f"Error switching role: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@role_switch_bp.route('/register-merchant', methods=['POST'])
@token_required
def register_as_merchant(current_user):
    """Register user as merchant (open shop)"""
    try:
        data = request.get_json()
        shop_name = data.get('shop_name')
        shop_address = data.get('shop_address')
        shop_phone = data.get('shop_phone')
        business_license = data.get('business_license')
        
        if not shop_name:
            return jsonify({'error': 'shop_name is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if already a merchant
        cur.execute("""
            SELECT user_role_id FROM app.user_roles
            WHERE user_id = %s AND role_id = 2
        """, (current_user['user_id'],))
        
        if cur.fetchone():
            return jsonify({'error': 'You are already registered as merchant'}), 400
        
        # Add merchant role (pending approval)
        cur.execute("""
            INSERT INTO app.user_roles (user_id, role_id, is_active, approved_at)
            VALUES (%s, 2, FALSE, NULL)
        """, (current_user['user_id'],))
        
        # Create merchant profile
        cur.execute("""
            INSERT INTO app.merchant_profiles 
            (user_id, shop_name, shop_address, shop_phone, business_license, is_verified)
            VALUES (%s, %s, %s, %s, %s, FALSE)
        """, (current_user['user_id'], shop_name, shop_address, shop_phone, business_license))
        
        conn.commit()
        
        return jsonify({
            'message': 'Registered as merchant successfully. Wait for admin approval.',
            'role_id': 2,
            'pending_approval': True
        }), 201
        
    except Exception as e:
        print(f"Error registering merchant: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@role_switch_bp.route('/register-shipper', methods=['POST'])
@token_required
def register_as_shipper(current_user):
    """Register user as shipper"""
    try:
        data = request.get_json()
        vehicle_type = data.get('vehicle_type', 'bike')
        license_plate = data.get('license_plate')
        id_card_number = data.get('id_card_number')
        
        if not id_card_number:
            return jsonify({'error': 'id_card_number is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if already a shipper
        cur.execute("""
            SELECT user_role_id FROM app.user_roles
            WHERE user_id = %s AND role_id = 3
        """, (current_user['user_id'],))
        
        if cur.fetchone():
            return jsonify({'error': 'You are already registered as shipper'}), 400
        
        # Add shipper role (pending approval)
        cur.execute("""
            INSERT INTO app.user_roles (user_id, role_id, is_active, approved_at)
            VALUES (%s, 3, FALSE, NULL)
        """, (current_user['user_id'],))
        
        # Update user's shipper_profiles if shipper_id exists
        # Note: shipper_profiles table uses different schema - we'll just mark the role pending
        # Admin will verify through existing shipper verification flow
        
        conn.commit()
        
        return jsonify({
            'message': 'Registered as shipper successfully. Wait for admin approval.',
            'role_id': 3,
            'pending_approval': True
        }), 201
        
    except Exception as e:
        print(f"Error registering shipper: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@role_switch_bp.route('/current', methods=['GET'])
@token_required
def get_current_role(current_user):
    """Get current active role"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT current_role_id FROM app.users WHERE user_id = %s
        """, (current_user['user_id'],))
        
        result = cur.fetchone()
        role_id = result[0] if result else 4
        
        role_names = {1: 'admin', 2: 'merchant', 3: 'shipper', 4: 'customer'}
        
        return jsonify({
            'current_role_id': role_id,
            'current_role_name': role_names.get(role_id, 'customer')
        }), 200
        
    except Exception as e:
        print(f"Error getting current role: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
