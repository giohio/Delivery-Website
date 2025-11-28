from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
from routes.notifications import push_notification

deliveries_bp = Blueprint("deliveries", __name__, url_prefix="/deliveries")

# ---------------- Helpers ----------------
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

def append_tracking(delivery_id:int, event_type:str, status:str=None, note:str=None, lat=None, lng=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO app.tracking_events (delivery_id, event_type, status, description, lat, lng)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (delivery_id, event_type, status, note, lat, lng))
    conn.commit()
    cur.close(); conn.close()


# ---------------- Endpoints ----------------

# list all available orders (for shippers)
@deliveries_bp.get("/available")
def available_orders():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers can view available orders"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get all orders, not just PENDING - shipper can see all orders like customer
    cur.execute("SELECT * FROM app.orders ORDER BY created_at DESC;")
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": rows})

# shipper creates a delivery (assigns orders to themselves)
@deliveries_bp.post("")
def create_delivery():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers can create deliveries"}), 403

    data = request.get_json(force=True)
    order_ids = data.get("order_ids")  # list of order IDs to pick up
    max_capacity = data.get("max_capacity", len(order_ids))

    if not order_ids or not isinstance(order_ids, list):
        return jsonify({"ok": False, "error": "order_ids (list) required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # ensure all orders are pending
    cur.execute("SELECT order_id FROM app.orders WHERE order_id = ANY(%s) AND status = 'PENDING';", (order_ids,))
    valid = cur.fetchall()
    if len(valid) != len(order_ids):
        return jsonify({"ok": False, "error": "Some orders are not available"}), 409

    # create delivery
    cur.execute("""
        INSERT INTO app.deliveries (shipper_id, max_capacity, status, assigned_at, updated_at)
        VALUES (%s, %s, 'ASSIGNED', NOW(), NOW())
        RETURNING *;
    """, (session["user_id"], max_capacity))
    delivery = cur.fetchone()

    # link orders to this delivery
    cur.execute("""
        UPDATE app.orders
           SET delivery_id = %s, status = 'ASSIGNED'
         WHERE order_id = ANY(%s);
    """, (delivery["delivery_id"], order_ids))

    conn.commit()
    cur.close(); conn.close()

    append_tracking(delivery["delivery_id"], "STATUS", "ASSIGNED", "Delivery created by shipper")

    return jsonify({"ok": True, "delivery": delivery})


# update delivery status (shipper only)
@deliveries_bp.put("/<int:delivery_id>/status")
def update_delivery_status(delivery_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers can update delivery status"}), 403

    data = request.get_json(force=True)
    new_status = data.get("status")
    note = data.get("note")
    lat = data.get("lat")
    lng = data.get("lng")

    if new_status not in ["ONGOING", "COMPLETED", "CANCELED"]:
        return jsonify({"ok": False, "error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # ensure delivery belongs to this shipper
    cur.execute("SELECT * FROM app.deliveries WHERE delivery_id = %s AND shipper_id = %s;",
                (delivery_id, session["user_id"]))
    delivery = cur.fetchone()
    if not delivery:
        return jsonify({"ok": False, "error": "Delivery not found or not owned"}), 404

    # update delivery
    cur.execute("""
        UPDATE app.deliveries
           SET status = %s, updated_at = NOW(),
               delivered_at = CASE WHEN %s = 'COMPLETED' THEN NOW() ELSE delivered_at END
         WHERE delivery_id = %s
     RETURNING *;
    """, (new_status, new_status, delivery_id))
    updated = cur.fetchone()

    # -------- cascade logic --------
    if new_status == "ONGOING":
        # mark all orders in this delivery as ONGOING
        cur.execute("""
            UPDATE app.orders
               SET status = 'ONGOING'
             WHERE delivery_id = %s;
        """, (delivery_id,))
        print(f"[INFO] Updated orders to ONGOING for delivery_id={delivery_id}")
    
    elif new_status == "COMPLETED":
        # mark all orders in this delivery as COMPLETED
        cur.execute("""
            UPDATE app.orders
               SET status = 'COMPLETED'
             WHERE delivery_id = %s
         RETURNING order_id, price_estimate;
        """, (delivery_id,))
        orders = cur.fetchall()
        print(f"[INFO] Updated {len(orders)} orders to COMPLETED for delivery_id={delivery_id}")

        # update payments (CASH → SUCCESS if still pending)
        for o in orders:
            cur.execute("""
                UPDATE app.payments
                   SET status = 'SUCCESS', paid_at = NOW()
                 WHERE order_id = %s AND method = 'CASH' AND status = 'PENDING';
            """, (o["order_id"],))

        # credit shipper wallet
        total_earning = sum([o["price_estimate"] or 0 for o in orders])
        cur.execute("""
            UPDATE app.shipper_wallets
               SET balance = balance + %s, updated_at = NOW()
             WHERE shipper_id = %s
         RETURNING balance;
        """, (total_earning, session["user_id"]))
        wallet = cur.fetchone()

        # log wallet transaction
        cur.execute("""
            INSERT INTO app.shipper_wallet_transactions
                (shipper_id, amount, type, ref_delivery_id, note, balance_after, created_at)
            VALUES (%s, %s, 'CREDIT', %s, %s, %s, NOW());
        """, (session["user_id"], total_earning, delivery_id,
              "Earnings from completed delivery", wallet["balance"]))

    elif new_status == "CANCELED":
        # Cancel all linked orders
        cur.execute("""
            UPDATE app.orders
               SET status = 'CANCELED'
             WHERE delivery_id = %s;
        """, (delivery_id,))
        # Refund payments
        cur.execute("""
            UPDATE app.payments
               SET refunded = true, status = 'FAILED'
             WHERE order_id IN (SELECT order_id FROM app.orders WHERE delivery_id = %s);
        """, (delivery_id,))

    conn.commit()
    cur.close(); conn.close()

    append_tracking(delivery_id, "STATUS", new_status, note, lat, lng)

    try:
    # Notify the shipper about the status change
        push_notification(session["user_id"],
                        "Delivery Update",
                        f"Your delivery #{delivery_id} status changed to {new_status}.")

        # Notify all customers whose orders are in this delivery
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT customer_id FROM app.orders WHERE delivery_id = %s;", (delivery_id,))
        customers = [r[0] for r in cur.fetchall()]
        cur.close()

        for cid in customers:
            msg = ""
            if new_status == "ONGOING":
                msg = f"Your delivery #{delivery_id} is now in progress."
            elif new_status == "COMPLETED":
                msg = f"Your delivery #{delivery_id} has been completed. Thank you!"
            elif new_status == "CANCELED":
                msg = f"Your delivery #{delivery_id} was canceled."

            push_notification(cid, "Delivery Update", msg)
    except Exception as e:
        print("Notification error:", e)

    return jsonify({"ok": True, "delivery": updated})


#shipper views their deliveries
@deliveries_bp.get("/my")
def my_deliveries():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers can view their deliveries"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.deliveries WHERE shipper_id = %s ORDER BY updated_at DESC;", (session["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "deliveries": rows})


# get tracking events for a delivery
@deliveries_bp.get("/<int:delivery_id>/tracking")
def delivery_tracking(delivery_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.tracking_events WHERE delivery_id = %s ORDER BY created_at ASC;", (delivery_id,))
    events = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "tracking": events})
