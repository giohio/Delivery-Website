from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
from routes.notifications import push_notification

merchant_bp = Blueprint("merchant", __name__, url_prefix="/merchant")

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

def role_name(role_id:int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT role_name FROM app.roles WHERE role_id = %s;", (role_id,))
    r = cur.fetchone()
    cur.close(); conn.close()
    return r[0] if r else None


# ---- ENDPOINTS ----

# merchant creates an order
@merchant_bp.post("/orders")
def create_order_for_customer():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can create orders"}), 403

    data = request.get_json(force=True)
    customer_id = data.get("customer_id")
    pickup_address = data.get("pickup_address")
    delivery_address = data.get("delivery_address")
    distance_km = data.get("distance_km")
    price_estimate = data.get("price_estimate")
    service_type = data.get("service_type", "bike")
    package_size = data.get("package_size", "small")
    pickup_contact_name = data.get("pickup_contact_name")
    pickup_contact_phone = data.get("pickup_contact_phone")
    delivery_contact_name = data.get("delivery_contact_name")
    delivery_contact_phone = data.get("delivery_contact_phone")
    notes = data.get("notes")

    if not all([customer_id, pickup_address, delivery_address]):
        return jsonify({"ok": False, "error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        INSERT INTO app.orders
            (customer_id, merchant_id, pickup_address, delivery_address, status, 
             distance_km, price_estimate, service_type, package_size,
             pickup_contact_name, pickup_contact_phone,
             delivery_contact_name, delivery_contact_phone, notes)
        VALUES (%s, %s, %s, %s, 'PENDING', %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING order_id, customer_id, merchant_id, pickup_address, delivery_address,
                  status, distance_km, price_estimate, service_type, package_size, created_at;
    """, (customer_id, session["user_id"], pickup_address, delivery_address, distance_km, price_estimate,
          service_type, package_size, pickup_contact_name, pickup_contact_phone,
          delivery_contact_name, delivery_contact_phone, notes))
    order = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()

    try:
        push_notification(customer_id, "New Order from Merchant",
                          f"Your order #{order['order_id']} has been placed by a merchant.")
    except Exception as e:
        print("Notification error:", e)

    return jsonify({"ok": True, "order": order}), 201


#views all their created orders
@merchant_bp.get("/orders")
def list_merchant_orders():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can view their orders"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT o.*, u.full_name AS customer_name
          FROM app.orders o
          JOIN app.users u ON o.customer_id = u.user_id
         WHERE o.merchant_id = %s
         ORDER BY o.created_at DESC;
    """, (session["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": rows})


# merchant views deliveries
@merchant_bp.get("/deliveries")
def merchant_deliveries():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can view deliveries"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT d.*, s.full_name AS shipper_name
          FROM app.deliveries d
          JOIN app.orders o ON o.delivery_id = d.delivery_id
          JOIN app.users s ON d.shipper_id = s.user_id
         WHERE o.merchant_id = %s
         GROUP BY d.delivery_id, s.full_name
         ORDER BY d.updated_at DESC;
    """, (session["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "deliveries": rows})


# merchant views payment summary
@merchant_bp.get("/payments")
def merchant_payments():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can view payments"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT p.*, o.order_id, o.customer_id, o.status AS order_status
          FROM app.payments p
          JOIN app.orders o ON p.order_id = o.order_id
         WHERE o.merchant_id = %s
         ORDER BY p.paid_at DESC NULLS LAST;
    """, (session["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "payments": rows})


# merchant accepts an order (assigns themselves to it)
@merchant_bp.post("/orders/<int:order_id>/accept")
def accept_order(order_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can accept orders"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Check if order exists and is not already assigned
    cur.execute("""
        SELECT order_id, customer_id, merchant_id, status
        FROM app.orders
        WHERE order_id = %s;
    """, (order_id,))
    order = cur.fetchone()
    
    if not order:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "Order not found"}), 404
    
    if order["merchant_id"] is not None:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "Order already assigned to a merchant"}), 400
    
    # Assign merchant to order
    cur.execute("""
        UPDATE app.orders
        SET merchant_id = %s, status = 'ACCEPTED'
        WHERE order_id = %s
        RETURNING order_id, customer_id, merchant_id, pickup_address, 
                  delivery_address, status, created_at;
    """, (session["user_id"], order_id))
    updated_order = cur.fetchone()
    conn.commit()
    
    # Send notification to customer
    try:
        push_notification(
            updated_order["customer_id"], 
            "Order Accepted by Merchant",
            f"Your order #{order_id} has been accepted and is being processed."
        )
    except Exception as e:
        print("Notification error:", e)
    
    cur.close(); conn.close()
    return jsonify({"ok": True, "order": updated_order})


# merchant views available orders (not yet assigned to any merchant)
@merchant_bp.get("/available-orders")
def get_available_orders():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can view available orders"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT o.*, u.full_name AS customer_name
        FROM app.orders o
        JOIN app.users u ON o.customer_id = u.user_id
        WHERE o.merchant_id IS NULL AND o.status = 'PENDING'
        ORDER BY o.created_at DESC;
    """)
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": rows})


# search customers by name, email, or phone
@merchant_bp.get("/customers/search")
def search_customers():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "merchant":
        return jsonify({"ok": False, "error": "Only merchants can search customers"}), 403

    query = request.args.get("q", "").strip()
    
    if not query or len(query) < 2:
        return jsonify({"ok": True, "customers": []})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # Search by name, email, or phone for customers only (role_id = 4)
    cur.execute("""
        SELECT user_id, full_name, email, phone, created_at
        FROM app.users
        WHERE role_id = 4 
          AND is_active = TRUE
          AND (
              LOWER(full_name) LIKE LOWER(%s) OR
              LOWER(email) LIKE LOWER(%s) OR
              phone LIKE %s
          )
        ORDER BY full_name
        LIMIT 20;
    """, (f"%{query}%", f"%{query}%", f"%{query}%"))
    
    customers = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "customers": customers})

