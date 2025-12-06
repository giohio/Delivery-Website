# routes/auth.py
from flask import Blueprint, request, jsonify
from db import get_db_connection
from firebase_admin import auth as firebase_auth
import psycopg2.extras
from utils.auth import hash_password, check_password, create_jwt, decode_jwt
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# Helper: store token in api_tokens
def save_token(user_id: int, token: str, minutes: int = 1440):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO app.api_tokens (user_id, token, expires_at)
        VALUES (%s, %s, NOW() + INTERVAL '%s minute')
        RETURNING token_id;
        """,
        (user_id, token, minutes)
    )
    token_id = cur.fetchone()[0]
    conn.commit()
    cur.close(); conn.close()
    return token_id

# Helper: revoke token (logout)
def revoke_token(token: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE app.api_tokens SET revoked = TRUE WHERE token = %s;", (token,))
    conn.commit()
    cur.close(); conn.close()

# Middleware-like helper: verify token is valid & not revoked/expired
def get_user_from_token(token: str):
    try:
        payload = decode_jwt(token)
    except Exception as e:
        return None, f"Invalid token: {e}"

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT t.user_id, t.expires_at, t.revoked, u.username, u.email, u.role_id
        FROM app.api_tokens t
        JOIN app.users u ON u.user_id = t.user_id
        WHERE t.token = %s
        """,
        (token,)
    )
    row = cur.fetchone()
    cur.close(); conn.close()

    if not row:
        return None, "Token not found"

    if row["revoked"]:
        return None, "Token revoked"

    if row["expires_at"] < datetime.utcnow():
        return None, "Token expired"

    return row, None

# --------- ROUTES ---------

@auth_bp.post("/register")
def register():
    data = request.get_json(force=True)
    username = data.get("username", "").strip()
    email    = data.get("email", "").strip()
    phone    = data.get("phone", "").strip()
    full_name= data.get("full_name", "").strip()
    password = data.get("password", "")
    role     = data.get("role", "customer")  # default customer

    if not username or not email or not password:
        return jsonify({"ok": False, "error": "username, email, password are required"}), 400

    # find role_id
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT role_id FROM app.roles WHERE role_name = %s;", (role,))
    r = cur.fetchone()
    if not r:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": f"role '{role}' not found"}), 400
    role_id = r["role_id"]

    # insert user
    try:
        pwd_hash = hash_password(password)
        cur.execute(
            """
            INSERT INTO app.users (username, password_hash, email, phone, full_name, role_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING user_id, username, email, role_id, created_at;
            """,
            (username, pwd_hash, email, phone, full_name, role_id)
        )
        row = cur.fetchone()
        user_id = row['user_id']
        
        # If customer, create wallet with initial balance
        if role == 'customer':
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance)
                VALUES (%s, 0)
                ON CONFLICT (user_id) DO NOTHING;
            """, (user_id,))
            print(f"[Register] Created wallet for customer user_id={user_id}")
        
        # If shipper, create shipper wallet
        elif role == 'shipper':
            cur.execute("""
                INSERT INTO app.shipper_wallets (shipper_id, balance)
                VALUES (%s, 0)
                ON CONFLICT (shipper_id) DO NOTHING;
            """, (user_id,))
            print(f"[Register] Created shipper wallet for user_id={user_id}")
        
        conn.commit()
        return jsonify({"ok": True, "user": row}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"ok": False, "error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    username_or_email = data.get("username") or data.get("email")
    password = data.get("password", "")

    if not username_or_email or not password:
        return jsonify({"ok": False, "error": "username/email and password are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # allow login by username or email
    cur.execute(
        """
        SELECT user_id, username, email, password_hash, role_id, is_active
        FROM app.users
        WHERE username = %s OR email = %s
        """,
        (username_or_email, username_or_email)
    )
    user = cur.fetchone()
    if not user:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "User not found"}), 404

    if not user["is_active"]:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "User is inactive"}), 403

    if not check_password(password, user["password_hash"]):
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "Invalid credentials"}), 401

    # create JWT and store in api_tokens
    token = create_jwt({"sub": str(user["user_id"]), "username": user["username"], "role_id": user["role_id"]})
    save_token(user["user_id"], token)

    cur.close(); conn.close()

    return jsonify({
        "ok": True,
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
            "role_id": user["role_id"]
        }
    })

@auth_bp.post("/logout")
def logout():

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"ok": False, "error": "Missing Bearer token"}), 401
    token = auth.split(" ", 1)[1]
    revoke_token(token)
    return jsonify({"ok": True, "message": "Logged out"}), 200

@auth_bp.get("/me")
def me():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"ok": False, "error": "Missing Bearer token"}), 401
    token = auth.split(" ", 1)[1]

    user_row, err = get_user_from_token(token)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    return jsonify({
        "ok": True,
        "user": {
            "user_id": user_row["user_id"],
            "username": user_row["username"],
            "email": user_row["email"],
            "role_id": user_row["role_id"]
        }
    })

@auth_bp.get("/debug-token")
def debug_token():
    auth = request.headers.get("Authorization", "")
    return {"header": auth}

@auth_bp.post("/firebase")
def firebase_login():
    data = request.get_json(force=True)
    id_token = data.get("id_token")

    if not id_token:
        return jsonify({"ok": False, "error": "Missing id_token"}), 400

    try:
        # Verify Firebase ID Token
        decoded_token = firebase_auth.verify_id_token(id_token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")
        name = decoded_token.get("name", f"user_{firebase_uid}")

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM app.users WHERE email = %s;", (email,))
        user = cur.fetchone()

        if not user:
            cur.execute(
                """
                INSERT INTO app.users (username, email, full_name, role_id, is_active)
                VALUES (%s, %s, %s, (SELECT role_id FROM app.roles WHERE role_name='customer'), TRUE)
                RETURNING user_id, username, email, role_id;
                """,
                (f"firebase_{firebase_uid}", email, name)
            )
            user = cur.fetchone()
            conn.commit()

        # Issue your own JWT
        jwt_token = create_jwt({
            "sub": str(user["user_id"]),
            "username": user["username"],
            "role_id": user["role_id"]
        })

        cur.close(); conn.close()
        return jsonify({"ok": True, "token": jwt_token, "user": user})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 401

