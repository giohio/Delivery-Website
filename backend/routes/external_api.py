from flask import Blueprint, jsonify, request
from routes.api_keys import api_key_required
from db import get_db_connection

external_api_bp = Blueprint('external_api', __name__, url_prefix='/api/external')

@external_api_bp.route('/orders', methods=['GET'])
@api_key_required
def get_orders_external(api_key_info):
    """
    External API endpoint for third-party apps to fetch orders
    Requires API key authentication
    """
    try:
        # Check permissions
        if 'orders:read' not in api_key_info['permissions']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get orders for the API key owner
        cur.execute("""
            SELECT 
                order_id,
                pickup_address,
                delivery_address,
                status,
                price_estimate,
                distance_km,
                created_at
            FROM app.orders
            WHERE customer_id = %s
            ORDER BY created_at DESC
            LIMIT 100
        """, (api_key_info['user_id'],))
        
        orders = []
        for row in cur.fetchall():
            orders.append({
                'order_id': row[0],
                'pickup_address': row[1],
                'delivery_address': row[2],
                'status': row[3],
                'price_estimate': float(row[4]) if row[4] else 0,
                'distance_km': float(row[5]) if row[5] else 0,
                'created_at': row[6].isoformat() if row[6] else None
            })
        
        return jsonify({
            'success': True,
            'data': orders,
            'count': len(orders)
        }), 200
        
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@external_api_bp.route('/orders', methods=['POST'])
@api_key_required
def create_order_external(api_key_info):
    """
    External API endpoint for third-party apps to create orders
    Requires API key authentication with orders:write permission
    """
    try:
        # Check permissions
        if 'orders:write' not in api_key_info['permissions']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['pickup_address', 'delivery_address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create order
        cur.execute("""
            INSERT INTO app.orders (
                customer_id,
                pickup_address,
                delivery_address,
                pickup_lat,
                pickup_lng,
                delivery_lat,
                delivery_lng,
                distance_km,
                price_estimate,
                service_type,
                package_size,
                notes,
                status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDING')
            RETURNING order_id, created_at
        """, (
            api_key_info['user_id'],
            data['pickup_address'],
            data['delivery_address'],
            data.get('pickup_lat'),
            data.get('pickup_lng'),
            data.get('delivery_lat'),
            data.get('delivery_lng'),
            data.get('distance_km', 0),
            data.get('price_estimate', 0),
            data.get('service_type', 'bike'),
            data.get('package_size', 'small'),
            data.get('notes', ''),
        ))
        
        result = cur.fetchone()
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order_id': result[0],
                'status': 'PENDING',
                'created_at': result[1].isoformat()
            }
        }), 201
        
    except Exception as e:
        print(f"Error creating order: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@external_api_bp.route('/orders/<int:order_id>', methods=['GET'])
@api_key_required
def get_order_detail_external(api_key_info, order_id):
    """Get specific order details"""
    try:
        if 'orders:read' not in api_key_info['permissions']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                order_id,
                pickup_address,
                delivery_address,
                status,
                price_estimate,
                distance_km,
                service_type,
                package_size,
                notes,
                created_at,
                updated_at
            FROM app.orders
            WHERE order_id = %s AND customer_id = %s
        """, (order_id, api_key_info['user_id']))
        
        row = cur.fetchone()
        
        if not row:
            return jsonify({'error': 'Order not found'}), 404
        
        order = {
            'order_id': row[0],
            'pickup_address': row[1],
            'delivery_address': row[2],
            'status': row[3],
            'price_estimate': float(row[4]) if row[4] else 0,
            'distance_km': float(row[5]) if row[5] else 0,
            'service_type': row[6],
            'package_size': row[7],
            'notes': row[8],
            'created_at': row[9].isoformat() if row[9] else None,
            'updated_at': row[10].isoformat() if row[10] else None
        }
        
        return jsonify({
            'success': True,
            'data': order
        }), 200
        
    except Exception as e:
        print(f"Error fetching order: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
