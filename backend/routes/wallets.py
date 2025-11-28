from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt

wallets_bp = Blueprint("wallets", __name__, url_prefix="/wallet")

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


# ---- endpoints ----

# get current wallet balance
@wallets_bp.get("")
def get_wallet():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers have wallets"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.shipper_wallets WHERE shipper_id = %s;", (session["user_id"],))
    wallet = cur.fetchone()
    cur.close(); conn.close()

    if not wallet:
        return jsonify({"ok": False, "error": "Wallet not found"}), 404

    return jsonify({"ok": True, "wallet": wallet})


#get wallet transactions
@wallets_bp.get("/transactions")
def wallet_transactions():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    if role_name(session["role_id"]) != "shipper":
        return jsonify({"ok": False, "error": "Only shippers have transactions"}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT * FROM app.shipper_wallet_transactions
         WHERE shipper_id = %s
         ORDER BY created_at DESC;
    """, (session["user_id"],))
    txns = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "transactions": txns})
