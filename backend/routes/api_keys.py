from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.auth import token_required
import secrets
import hashlib
import json
from datetime import datetime, timedelta

api_keys_bp = Blueprint('api_keys', __name__, url_prefix='/api/api-keys')

def generate_api_key():
    """Generate a unique API key"""
    return 'sk_' + secrets.token_urlsafe(32)

def generate_api_secret():
    """Generate a unique API secret"""
    return 'ss_' + secrets.token_urlsafe(48)

def hash_secret(secret):
    """Hash the API secret for storage"""
    return hashlib.sha256(secret.encode()).hexdigest()

@api_keys_bp.route('', methods=['GET'])
@token_required
def get_api_keys(current_user):
    """Get all API keys for current user"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                api_key_id,
                key_name,
                api_key,
                permissions,
                is_active,
                rate_limit,
                last_used_at,
                expires_at,
                created_at
            FROM app.api_keys
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (current_user['user_id'],))
        
        keys = []
        for row in cur.fetchall():
            keys.append({
                'api_key_id': row[0],
                'key_name': row[1],
                'api_key': row[2],
                'permissions': row[3] or [],
                'is_active': row[4],
                'rate_limit': row[5],
                'last_used_at': row[6].isoformat() if row[6] else None,
                'expires_at': row[7].isoformat() if row[7] else None,
                'created_at': row[8].isoformat() if row[8] else None
            })
        
        return jsonify({'api_keys': keys}), 200
        
    except Exception as e:
        print(f"Error getting API keys: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@api_keys_bp.route('', methods=['POST'])
@token_required
def create_api_key(current_user):
    """Create a new API key"""
    try:
        data = request.get_json()
        key_name = data.get('key_name')
        permissions = data.get('permissions', [])
        rate_limit = data.get('rate_limit', 1000)
        expires_in_days = data.get('expires_in_days')  # Optional: expiry in days
        
        if not key_name:
            return jsonify({'error': 'Key name is required'}), 400
        
        # Generate API key and secret
        api_key = generate_api_key()
        api_secret = generate_api_secret()
        hashed_secret = hash_secret(api_secret)
        
        # Calculate expiry date if provided
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO app.api_keys (
                key_name, 
                api_key, 
                api_secret, 
                user_id, 
                permissions, 
                rate_limit,
                expires_at
            )
            VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)
            RETURNING api_key_id, created_at
        """, (key_name, api_key, hashed_secret, current_user['user_id'], 
              json.dumps(permissions), rate_limit, expires_at))
        
        result = cur.fetchone()
        conn.commit()
        
        return jsonify({
            'message': 'API key created successfully',
            'api_key_id': result[0],
            'api_key': api_key,
            'api_secret': api_secret,  # Only returned once!
            'key_name': key_name,
            'permissions': permissions,
            'rate_limit': rate_limit,
            'expires_at': expires_at.isoformat() if expires_at else None,
            'created_at': result[1].isoformat(),
            'warning': 'Save the API secret now. You will not be able to see it again!'
        }), 201
        
    except Exception as e:
        print(f"Error creating API key: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@api_keys_bp.route('/<int:api_key_id>', methods=['PUT'])
@token_required
def update_api_key(current_user, api_key_id):
    """Update API key settings"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("""
            SELECT api_key_id FROM app.api_keys 
            WHERE api_key_id = %s AND user_id = %s
        """, (api_key_id, current_user['user_id']))
        
        if not cur.fetchone():
            return jsonify({'error': 'API key not found'}), 404
        
        # Build update query dynamically
        updates = []
        params = []
        
        if 'key_name' in data:
            updates.append('key_name = %s')
            params.append(data['key_name'])
        
        if 'permissions' in data:
            updates.append('permissions = %s::jsonb')
            params.append(json.dumps(data['permissions']))
        
        if 'rate_limit' in data:
            updates.append('rate_limit = %s')
            params.append(data['rate_limit'])
        
        if 'is_active' in data:
            updates.append('is_active = %s')
            params.append(data['is_active'])
        
        if not updates:
            return jsonify({'error': 'No fields to update'}), 400
        
        updates.append('updated_at = NOW()')
        params.append(api_key_id)
        
        cur.execute(f"""
            UPDATE app.api_keys 
            SET {', '.join(updates)}
            WHERE api_key_id = %s
        """, params)
        
        conn.commit()
        
        return jsonify({'message': 'API key updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating API key: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@api_keys_bp.route('/<int:api_key_id>', methods=['DELETE'])
@token_required
def delete_api_key(current_user, api_key_id):
    """Delete/revoke an API key"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verify ownership and delete
        cur.execute("""
            DELETE FROM app.api_keys 
            WHERE api_key_id = %s AND user_id = %s
            RETURNING api_key_id
        """, (api_key_id, current_user['user_id']))
        
        if not cur.fetchone():
            return jsonify({'error': 'API key not found'}), 404
        
        conn.commit()
        
        return jsonify({'message': 'API key deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting API key: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# Middleware to validate API key for external requests
def api_key_required(f):
    """Decorator to validate API key"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        api_secret = request.headers.get('X-API-Secret')
        
        if not api_key or not api_secret:
            return jsonify({'error': 'API key and secret required'}), 401
        
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            hashed_secret = hash_secret(api_secret)
            
            cur.execute("""
                SELECT 
                    k.api_key_id,
                    k.user_id,
                    k.permissions,
                    k.rate_limit,
                    k.expires_at,
                    u.email,
                    u.full_name
                FROM app.api_keys k
                JOIN app.users u ON k.user_id = u.user_id
                WHERE k.api_key = %s 
                    AND k.api_secret = %s 
                    AND k.is_active = true
            """, (api_key, hashed_secret))
            
            result = cur.fetchone()
            
            if not result:
                return jsonify({'error': 'Invalid API credentials'}), 401
            
            # Check if expired
            if result[4] and result[4] < datetime.utcnow():
                return jsonify({'error': 'API key has expired'}), 401
            
            # Update last used timestamp
            cur.execute("""
                UPDATE app.api_keys 
                SET last_used_at = NOW() 
                WHERE api_key_id = %s
            """, (result[0],))
            conn.commit()
            
            # Pass API key info to the route
            api_key_info = {
                'api_key_id': result[0],
                'user_id': result[1],
                'permissions': result[2] or [],
                'rate_limit': result[3],
                'email': result[5],
                'full_name': result[6]
            }
            
            return f(api_key_info, *args, **kwargs)
            
        except Exception as e:
            print(f"Error validating API key: {e}")
            return jsonify({'error': 'Authentication failed'}), 500
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()
    
    return decorated_function
