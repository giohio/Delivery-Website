from flask import Blueprint, jsonify, request
from db import get_db_connection
from utils.auth import token_required
import bcrypt

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/user/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user profile"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                u.user_id,
                u.email,
                u.full_name,
                u.phone,
                u.avatar,
                u.created_at,
                r.role_name
            FROM app.users u
            LEFT JOIN app.roles r ON u.role_id = r.role_id
            WHERE u.user_id = %s
        """, (current_user['user_id'],))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': user[0],
            'email': user[1],
            'full_name': user[2],
            'phone': user[3],
            'avatar': user[4],
            'created_at': user[5].isoformat() if user[5] else None,
            'role': user[6]
        }), 200
        
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@user_bp.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile (name, phone, avatar)"""
    try:
        data = request.get_json()
        full_name = data.get('fullName')
        phone = data.get('phone')
        avatar = data.get('avatar')
        
        if not full_name:
            return jsonify({'error': 'Full name is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE app.users
            SET full_name = %s, phone = %s, avatar = %s
            WHERE user_id = %s
            RETURNING user_id, email, full_name, phone, avatar
        """, (full_name, phone, avatar, current_user['user_id']))
        
        updated_user = cur.fetchone()
        conn.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'user_id': updated_user[0],
                'email': updated_user[1],
                'full_name': updated_user[2],
                'phone': updated_user[3],
                'avatar': updated_user[4]
            }
        }), 200
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@user_bp.route('/api/user/password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change user password"""
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get current password hash
        cur.execute("""
            SELECT password_hash
            FROM app.users
            WHERE user_id = %s
        """, (current_user['user_id'],))
        
        result = cur.fetchone()
        if not result:
            return jsonify({'error': 'User not found'}), 404
        
        stored_hash = result[0]
        
        # Verify current password
        if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Hash new password
        new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password
        cur.execute("""
            UPDATE app.users
            SET password_hash = %s
            WHERE user_id = %s
        """, (new_hash, current_user['user_id']))
        
        conn.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        print(f"Error changing password: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
