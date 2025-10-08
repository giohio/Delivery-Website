import os, jwt, datetime, bcrypt
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
   