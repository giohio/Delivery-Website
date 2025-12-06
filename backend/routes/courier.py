from flask import Blueprint, jsonify, request
from db import get_db_connection
from utils.auth import token_required

courier_bp = Blueprint('courier', __name__)

@courier_bp.route('/api/courier/profile', methods=['GET'])
@token_required
def get_courier_profile(current_user):
    """Get courier/shipper profile with KYC information"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get user basic info
        cur.execute("""
            SELECT 
                u.user_id,
                u.email,
                u.full_name,
                u.phone,
                u.created_at
            FROM app.users u
            WHERE u.user_id = %s
        """, (current_user['user_id'],))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get courier-specific profile from shipper_profiles
        cur.execute("""
            SELECT 
                operating_area,
                vehicle_type,
                license_plate,
                id_number,
                driver_license,
                bank_name,
                account_number,
                account_name,
                verification_status,
                id_front_image,
                id_back_image,
                license_image,
                vehicle_image
            FROM app.shipper_profiles
            WHERE shipper_id = %s
        """, (current_user['user_id'],))
        
        profile = cur.fetchone()
        
        result = {
            'user_id': user[0],
            'email': user[1],
            'full_name': user[2],
            'phone': user[3],
            'created_at': user[4].isoformat() if user[4] else None,
        }
        
        if profile:
            result.update({
                'operating_area': profile[0],
                'vehicle_type': profile[1],
                'license_plate': profile[2],
                'id_number': profile[3],
                'driver_license': profile[4],
                'bank_name': profile[5],
                'account_number': profile[6],
                'account_name': profile[7],
                'verification_status': profile[8],
                'id_front_image': profile[9],
                'id_back_image': profile[10],
                'license_image': profile[11],
                'vehicle_image': profile[12],
            })
        else:
            # Default values if no profile yet
            result.update({
                'operating_area': '',
                'vehicle_type': 'motorbike',
                'license_plate': '',
                'id_number': '',
                'driver_license': '',
                'bank_name': '',
                'account_number': '',
                'account_name': '',
                'verification_status': 'pending',
                'id_front_image': '',
                'id_back_image': '',
                'license_image': '',
                'vehicle_image': '',
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error getting courier profile: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@courier_bp.route('/api/courier/profile', methods=['PUT'])
@token_required
def update_courier_profile(current_user):
    """Update courier profile and KYC information"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Update user basic info (support both camelCase and snake_case)
        full_name = data.get('fullName') or data.get('full_name')
        phone = data.get('phone')
        
        if full_name:
            cur.execute("""
                UPDATE app.users
                SET full_name = %s, phone = %s
                WHERE user_id = %s
            """, (full_name, phone, current_user['user_id']))
        
        # Update or insert shipper profile (support both camelCase and snake_case)
        cur.execute("""
            INSERT INTO app.shipper_profiles (
                shipper_id,
                operating_area,
                vehicle_type,
                license_plate,
                id_number,
                driver_license,
                bank_name,
                account_number,
                account_name,
                id_front_image,
                id_back_image,
                license_image,
                vehicle_image,
                verification_status
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending'
            )
            ON CONFLICT (shipper_id) DO UPDATE SET
                operating_area = EXCLUDED.operating_area,
                vehicle_type = EXCLUDED.vehicle_type,
                license_plate = EXCLUDED.license_plate,
                id_number = EXCLUDED.id_number,
                driver_license = EXCLUDED.driver_license,
                bank_name = EXCLUDED.bank_name,
                account_number = EXCLUDED.account_number,
                account_name = EXCLUDED.account_name,
                id_front_image = EXCLUDED.id_front_image,
                id_back_image = EXCLUDED.id_back_image,
                license_image = EXCLUDED.license_image,
                vehicle_image = EXCLUDED.vehicle_image,
                verification_status = 'pending'
        """, (
            current_user['user_id'],
            data.get('operatingArea') or data.get('operating_area', ''),
            data.get('vehicleType') or data.get('vehicle_type', 'motorbike'),
            data.get('licensePlate') or data.get('license_plate', ''),
            data.get('idNumber') or data.get('id_number', ''),
            data.get('driverLicense') or data.get('driver_license', ''),
            data.get('bankName') or data.get('bank_name', ''),
            data.get('accountNumber') or data.get('account_number', ''),
            data.get('accountName') or data.get('account_name', ''),
            data.get('idFrontImage') or data.get('id_front_image', ''),
            data.get('idBackImage') or data.get('id_back_image', ''),
            data.get('licenseImage') or data.get('license_image', ''),
            data.get('vehicleImage') or data.get('vehicle_image', ''),
        ))
        
        conn.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating courier profile: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@courier_bp.route('/api/courier/verification-status', methods=['GET'])
@token_required
def get_verification_status(current_user):
    """Get courier verification status"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT verification_status
            FROM app.shipper_profiles
            WHERE shipper_id = %s
        """, (current_user['user_id'],))
        
        result = cur.fetchone()
        
        status = result[0] if result else 'pending'
        
        return jsonify({
            'verification_status': status,
            'can_accept_orders': status == 'approved'
        }), 200
        
    except Exception as e:
        print(f"Error getting verification status: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
