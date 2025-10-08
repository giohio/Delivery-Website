from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
import os
from routes.notifications import push_notification

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")

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

def get_order(order_id:int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.orders WHERE order_id = %s;", (order_id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return row

def get_delivery(delivery_id:int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.deliveries WHERE delivery_id = %s;", (delivery_id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return row

def append_tracking_event(delivery_id:int, event_type:str, status:str=None, note:str=None, lat=None, lng=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO app.tracking_events (delivery_id, event_type, status, description, lat, lng)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (delivery_id, event_type, status, note, lat, lng))
    conn.commit()
    cur.close(); conn.close()

# ---- endpoints ----

# create new order
@orders_bp.post("")
def create_order():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    
    data = request.get_json(force=True)
    pickup_address   = data.get("pickup_address")
    delivery_address = data.get("delivery_address")
    merchant_id      = data.get("merchant_id")   # optional
    distance_km      = data.get("distance_km")
    price_estimate   = data.get("price_estimate")

    if not pickup_address or not delivery_address:
        return jsonify({"ok": False, "error": "pickup_address and delivery_address are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        INSERT INTO app.orders
            (customer_id, merchant_id, pickup_address, delivery_address, status, distance_km, price_estimate)
        VALUES (%s, %s, %s, %s, 'PENDING', %s, %s)
        RETURNING order_id, customer_id, merchant_id, pickup_address, delivery_address,
                  status, distance_km, price_estimate, created_at;
    """, (session["user_id"], merchant_id, pickup_address, delivery_address, distance_km, price_estimate))
    order = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()
    try:
        push_notification(order["customer_id"], "Order Created",
                                f"Your order #{order['order_id']} is created.")
    except Exception as e:
        print("Notification error:", e)

    return jsonify({"ok": True, "order": order}), 201


# List orders for current user
@orders_bp.get("")
def list_orders():
    user, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # customers see their orders
    cur.execute("SELECT * FROM app.orders WHERE customer_id = %s ORDER BY created_at DESC;", (user["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": rows})


# Cancel order (customer/admin only if still pending)
@orders_bp.post("/<int:order_id>/cancel")
def cancel_order(order_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    order = get_order(order_id)
    if not order:
        return jsonify({"ok": False, "error": "Order not found"}), 404

    if order["status"] not in ("PENDING", "ASSIGNED"):
        return jsonify({"ok": False, "error": "Order cannot be canceled"}), 409

    rn = role_name(session["role_id"])
    if rn not in ("admin", "customer"):
        return jsonify({"ok": False, "error": "Forbidden"}), 403
    if rn == "customer" and session["user_id"] != order["customer_id"]:
        return jsonify({"ok": False, "error": "Forbidden"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        UPDATE app.orders
           SET status = 'CANCELED'
         WHERE order_id = %s
     RETURNING *;
    """, (order_id,))
    updated = cur.fetchone()

    if updated["delivery_id"]:
        cur.execute("""
            UPDATE app.deliveries
               SET status = 'CANCELED', updated_at = NOW()
             WHERE delivery_id = %s;
        """, (updated["delivery_id"],))
        append_tracking_event(updated["delivery_id"], "STATUS", "CANCELED", "Order canceled")

    conn.commit()
    try:
        push_notification(order["customer_id"], "Order Created",
                                f"Your order #{order['order_id']} is created.")
    except Exception as e:
        print("Notification error:", e)
    cur.close(); conn.close()
    return jsonify({"ok": True, "order": updated})
