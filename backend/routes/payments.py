from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
from routes.notifications import push_notification  

payments_bp = Blueprint("payments", __name__, url_prefix="/payments")

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


# ---------------- Endpoints ----------------
#create a payment for an order
@payments_bp.post("/<int:order_id>")
def create_payment(order_id:int):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    data = request.get_json()
    method = data.get("method")
    amount = data.get("amount")  
    transaction_ref = data.get("transaction_ref")

    if method not in ["CASH", "BANK", "WALLET"]:
       return jsonify({"ok": False, "error": "Invalid method"}), 400
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # ensure order exists & belongs to this customer
    cur.execute("SELECT * FROM app.orders WHERE order_id = %s;", (order_id,))
    order = cur.fetchone()
    if not order:
        return jsonify({"ok": False, "error": "Order not found"}), 404
    if role_name(session["role_id"]) == "customer" and order["customer_id"] != session["user_id"]:
        return jsonify({"ok": False, "error": "Forbidden"}), 403

    # create payment
    status = "PENDING" if method == "CASH" else "SUCCESS"
    cur.execute("""
        INSERT INTO app.payments (order_id, amount, method, status, transaction_ref, refunded, paid_at)
        VALUES (%s, %s, %s, %s, %s, false, CASE WHEN %s='SUCCESS' THEN NOW() ELSE NULL END)
        RETURNING *;
    """, (order_id, amount, method, status, transaction_ref, status))
    payment = cur.fetchone()

    conn.commit()
    cur.close(); conn.close()

    try:
        if payment["status"] == "SUCCESS":
            push_notification(order["customer_id"],
                            "Payment Successful",
                            f"Payment for order #{order_id} confirmed via {payment['method']}.")
        else:
            push_notification(order["customer_id"],
                            "Payment Pending",
                            f"Your order #{order_id} will be paid on delivery (CASH).")
    except Exception as e:
        print("Notification error:", e)


    return jsonify({"ok": True, "payment": payment}), 201

# get payment for an order
@payments_bp.get("/<int:order_id>")
def get_payment(order_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.payments WHERE order_id = %s;", (order_id,))
    payment = cur.fetchone()
    cur.close(); conn.close()

    if not payment:
        return jsonify({"ok": False, "error": "Payment not found"}), 404

    return jsonify({"ok": True, "payment": payment})

# refund payment (admin only)
@payments_bp.post("/<int:order_id>/refund")
def refund_payment(order_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "admin":
        return jsonify({"ok": False, "error": "Only admin can refund"}), 403

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

    try:
        push_notification(payment["order_id"], "Payment Refunded",
                        f"Payment for order #{order_id} has been refunded.")
    except Exception as e:
        print("Notification error:", e)

    cur.close(); conn.close()

    if not payment:
        return jsonify({"ok": False, "error": "Payment not found"}), 404

    return jsonify({"ok": True, "payment": payment})