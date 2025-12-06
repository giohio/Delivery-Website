from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
from routes.notifications import push_notification

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# ---- helpers ----
def current_session(req):
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, "Missing Bearer token"
    token = auth.split(" ", 1)[1]
    try:
        payload = decode_jwt(token)
        return {"user_id": int(payload["sub"]), "role_id": int(payload["role_id"])}, None
    except Exception as e:
        return None, f"Invalid token: {e}"

def is_admin(session):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT role_name FROM app.roles WHERE role_id = %s;", (session["role_id"],))
    r = cur.fetchone()
    cur.close(); conn.close()
    return r and r[0] == "admin"


# ---- Endpoints ----

# KYC Management
@admin_bp.get("/kyc/pending")
def get_pending_kyc():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT 
            k.id, k.shipper_id, u.full_name, u.email, u.phone,
            k.id_number, k.id_front_image, k.id_back_image,
            k.driver_license, k.license_image,
            k.vehicle_type, k.license_plate, k.vehicle_image,
            k.verification_status, k.created_at as submitted_at
        FROM app.kyc_submissions k
        JOIN app.users u ON k.shipper_id = u.user_id
        WHERE k.verification_status = 'pending'
        ORDER BY k.created_at DESC;
    """)
    submissions = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"ok": True, "submissions": submissions})

@admin_bp.get("/kyc/all")
def get_all_kyc():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403
    
    status = request.args.get('status')  # pending, approved, rejected, or None for all
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    query = """
        SELECT 
            k.id, k.shipper_id, u.full_name, u.email, u.phone,
            k.id_number, k.id_front_image, k.id_back_image,
            k.driver_license, k.license_image,
            k.vehicle_type, k.license_plate, k.vehicle_image,
            k.verification_status, k.rejection_reason,
            k.created_at as submitted_at, k.verified_at
        FROM app.kyc_submissions k
        JOIN app.users u ON k.shipper_id = u.user_id
    """
    
    if status:
        query += " WHERE k.verification_status = %s"
        cur.execute(query + " ORDER BY k.created_at DESC;", (status,))
    else:
        cur.execute(query + " ORDER BY k.created_at DESC;")
    
    submissions = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({"ok": True, "submissions": submissions})

@admin_bp.put("/kyc/<int:user_id>/approve")
def approve_kyc(user_id):
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Update verification status
    cur.execute("""
        UPDATE app.kyc_submissions
        SET verification_status = 'approved',
            verified_at = NOW(),
            updated_at = NOW()
        WHERE shipper_id = %s;
    """, (user_id,))
    
    # Get user email for notification
    cur.execute("SELECT email, full_name FROM app.users WHERE user_id = %s;", (user_id,))
    user = cur.fetchone()
    
    conn.commit()
    cur.close(); conn.close()
    
    # Send notification
    if user:
        push_notification(user_id, "KYC Approved", f"Congratulations {user[1]}! Your KYC verification has been approved.")
    
    return jsonify({"ok": True, "message": "KYC approved successfully"})

@admin_bp.put("/kyc/<int:user_id>/reject")
def reject_kyc(user_id):
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403
    
    data = request.get_json()
    reason = data.get('reason', 'Document verification failed')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Update verification status
    cur.execute("""
        UPDATE app.kyc_submissions
        SET verification_status = 'rejected',
            rejection_reason = %s,
            updated_at = NOW()
        WHERE shipper_id = %s;
    """, (reason, user_id))
    
    # Get user email
    cur.execute("SELECT email, full_name FROM app.users WHERE user_id = %s;", (user_id,))
    user = cur.fetchone()
    
    conn.commit()
    cur.close(); conn.close()
    
    # Send notification
    if user:
        push_notification(user_id, "KYC Rejected", f"Sorry {user[1]}, your KYC verification was rejected. Reason: {reason}")
    
    return jsonify({"ok": True, "message": "KYC rejected"})

# summary (counts)
@admin_bp.get("/summary")
def dashboard_summary():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
          (SELECT COUNT(*) FROM app.users) AS total_users,
          (SELECT COUNT(*) FROM app.orders) AS total_orders,
          (SELECT COUNT(*) FROM app.deliveries) AS total_deliveries,
          (SELECT COUNT(*) FROM app.payments WHERE status='SUCCESS') AS total_payments,
          (SELECT SUM(amount) FROM app.payments WHERE status='SUCCESS') AS revenue;
    """)
    stats = cur.fetchone()
    cur.close(); conn.close()

    return jsonify({"ok": True, "summary": stats})


# list all users
@admin_bp.get("/users")
def list_users():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT u.user_id, u.full_name, u.email, u.phone, r.role_name, u.is_active, u.created_at
          FROM app.users u
          JOIN app.roles r ON u.role_id = r.role_id
         ORDER BY u.created_at DESC;
    """)
    users = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "users": users})


# create new user
@admin_bp.post("/users")
def create_user():
    session, err = current_session(request)
    if err or not is_admin(session):
        print(f"[Admin Create User] Auth failed: {err}")
        return jsonify({"ok": False, "error": "Admin only"}), 403

    data = request.get_json(force=True)
    print(f"[Admin Create User] Received data: {data}")
    
    full_name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    role_name = data.get("role", "customer").strip().lower()

    print(f"[Admin Create User] Parsed - Name: {full_name}, Email: {email}, Phone: {phone}, Role: {role_name}")

    if not full_name or not email or not password:
        error_msg = "Name, email, and password are required"
        print(f"[Admin Create User] Validation failed: {error_msg}")
        return jsonify({"ok": False, "error": error_msg}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Get role_id
    cur.execute("SELECT role_id FROM app.roles WHERE role_name = %s;", (role_name,))
    r = cur.fetchone()
    if not r:
        cur.close(); conn.close()
        error_msg = f"Role '{role_name}' not found"
        print(f"[Admin Create User] Role validation failed: {error_msg}")
        return jsonify({"ok": False, "error": error_msg}), 400
    role_id = r["role_id"]
    print(f"[Admin Create User] Found role_id: {role_id} for role: {role_name}")

    # Check if email already exists
    cur.execute("SELECT user_id FROM app.users WHERE email = %s;", (email,))
    if cur.fetchone():
        cur.close(); conn.close()
        error_msg = "Email already registered"
        print(f"[Admin Create User] Duplicate email: {email}")
        return jsonify({"ok": False, "error": error_msg}), 400

    # Hash password
    from utils.auth import hash_password
    pwd_hash = hash_password(password)

    # Generate username from email
    username = email.split('@')[0]
    
    # Insert user
    try:
        print(f"[Admin Create User] Inserting user - Username: {username}, Email: {email}")
        cur.execute(
            """
            INSERT INTO app.users (username, password_hash, email, phone, full_name, role_id, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            RETURNING user_id, username, email, phone, full_name, role_id, is_active, created_at;
            """,
            (username, pwd_hash, email, phone, full_name, role_id)
        )
        user = cur.fetchone()
        user_id = user['user_id']
        
        # Create wallet based on role
        if role_name == 'customer':
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance)
                VALUES (%s, 0)
                ON CONFLICT (user_id) DO NOTHING;
            """, (user_id,))
            print(f"[Admin Create User] Created wallet for customer user_id={user_id}")
        
        elif role_name == 'shipper':
            cur.execute("""
                INSERT INTO app.shipper_wallets (shipper_id, balance)
                VALUES (%s, 0)
                ON CONFLICT (shipper_id) DO NOTHING;
            """, (user_id,))
            print(f"[Admin Create User] Created shipper wallet for user_id={user_id}")
        
        conn.commit()
        print(f"[Admin Create User] User created successfully - ID: {user_id}")

        # Get role name for response
        cur.execute("SELECT role_name FROM app.roles WHERE role_id = %s;", (user["role_id"],))
        role = cur.fetchone()
        user["role_name"] = role["role_name"] if role else role_name

        cur.close(); conn.close()
        return jsonify({"ok": True, "user": user, "message": "User created successfully"})
    except Exception as e:
        conn.rollback()
        cur.close(); conn.close()
        error_msg = f"Database error: {str(e)}"
        print(f"[Admin Create User] Database error: {e}")
        return jsonify({"ok": False, "error": error_msg}), 500


# list all orders
@admin_bp.get("/orders")
def list_orders():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT o.*, u.full_name AS customer_name
          FROM app.orders o
          JOIN app.users u ON o.customer_id = u.user_id
         ORDER BY o.created_at DESC;
    """)
    orders = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": orders})


# list all deliveries
@admin_bp.get("/deliveries")
def list_deliveries():
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT d.*, u.full_name AS shipper_name
          FROM app.deliveries d
          JOIN app.users u ON d.shipper_id = u.user_id
         ORDER BY d.updated_at DESC;
    """)
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "deliveries": rows})


# force refund for an order
@admin_bp.post("/payments/<int:order_id>/refund")
def admin_refund(order_id):
    session, err = current_session(request)
    if err or not is_admin(session):
        return jsonify({"ok": False, "error": "Admin only"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        UPDATE app.payments
           SET refunded = true, status = 'FAILED'
         WHERE order_id = %s
     RETURNING *;
    """, (order_id,))
    payment = cur.fetchone()
    conn.commit()

    if payment:
        push_notification(payment["order_id"], "Payment Refunded",
                          f"Admin refunded payment for order #{order_id}.")
    cur.close(); conn.close()

    return jsonify({"ok": True, "payment": payment})
