from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from utils.auth import token_required
import uuid
from datetime import datetime

upload_bp = Blueprint('upload', __name__)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, subfolder):
    """Save uploaded file and return the file path"""
    if not file:
        return None, "No file provided"
    
    if file.filename == '':
        return None, "No file selected"
    
    if not allowed_file(file.filename):
        return None, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return None, f"File too large. Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    
    # Create subfolder if not exists
    folder_path = os.path.join(UPLOAD_FOLDER, subfolder)
    os.makedirs(folder_path, exist_ok=True)
    
    # Save file
    file_path = os.path.join(folder_path, unique_filename)
    file.save(file_path)
    
    # Return relative path for database storage
    return f"/uploads/{subfolder}/{unique_filename}", None

@upload_bp.route('/upload/avatar', methods=['POST'])
@token_required
def upload_avatar(current_user):
    """Upload user avatar"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        file_path, error = save_file(file, 'avatars')
        
        if error:
            return jsonify({'error': error}), 400
        
        # TODO: Update user avatar in database
        # For now, just return the file path
        
        return jsonify({
            'ok': True,
            'file_path': file_path,
            'message': 'Avatar uploaded successfully'
        }), 200
        
    except Exception as e:
        print(f"Error uploading avatar: {e}")
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/upload/kyc', methods=['POST'])
@token_required
def upload_kyc(current_user):
    """Upload KYC documents (ID card, driver license, vehicle photos)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        document_type = request.form.get('type', 'general')  # id_front, id_back, license, vehicle
        
        file_path, error = save_file(file, 'kyc')
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'ok': True,
            'file_path': file_path,
            'document_type': document_type,
            'message': 'KYC document uploaded successfully'
        }), 200
        
    except Exception as e:
        print(f"Error uploading KYC document: {e}")
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/upload/pod', methods=['POST'])
@token_required
def upload_pod(current_user):
    """Upload Proof of Delivery photo"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        delivery_id = request.form.get('delivery_id')
        
        if not delivery_id:
            return jsonify({'error': 'delivery_id is required'}), 400
        
        file_path, error = save_file(file, 'pod')
        
        if error:
            return jsonify({'error': error}), 400
        
        # TODO: Update delivery record with POD image path
        
        return jsonify({
            'ok': True,
            'file_path': file_path,
            'delivery_id': delivery_id,
            'message': 'POD uploaded successfully'
        }), 200
        
    except Exception as e:
        print(f"Error uploading POD: {e}")
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files"""
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)
