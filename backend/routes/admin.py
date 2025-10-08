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
