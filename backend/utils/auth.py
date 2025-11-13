import os, jwt, datetime, bcrypt
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "1440")) # Default to 1 day

def hash_password(password: str) -> str:
   return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
   return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt(payload: dict) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXPIRES_MIN)
    to_encode = {**payload, "exp": exp}
    token = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    if isinstance(token, bytes):   # 🔥 force convert bytes to str
        token = token.decode("utf-8")
    return token

def decode_jwt(token: str) -> dict:
   decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
   return decoded

def token_required(f):
    """Decorator to require JWT token authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split(' ', 1)[1]
        
        try:
            payload = decode_jwt(token)
            current_user = {
                'user_id': int(payload['sub']),
                'role_id': int(payload['role_id'])
            }
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401
    
    return decorated_function
   