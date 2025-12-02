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
    
    user_role = role_name(session["role_id"])
    user_id = session["user_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    wallet = None
    
    if user_role == "shipper":
        # Shipper wallet
        cur.execute("SELECT * FROM app.shipper_wallets WHERE shipper_id = %s;", (user_id,))
        wallet = cur.fetchone()
    elif user_role == "customer":
        # Customer wallet - get or create
        cur.execute("SELECT * FROM app.wallets WHERE user_id = %s;", (user_id,))
        wallet = cur.fetchone()
        
        if not wallet:
            # Create wallet if doesn't exist
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance)
                VALUES (%s, 0)
                RETURNING *;
            """, (user_id,))
            wallet = cur.fetchone()
            conn.commit()
    else:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Wallet not available for this role"}), 403
    
    cur.close()
    conn.close()

    if not wallet:
        return jsonify({"ok": False, "error": "Wallet not found"}), 404

    return jsonify({"ok": True, "wallet": wallet, "balance": wallet.get('balance', 0)})


#get wallet transactions
@wallets_bp.get("/transactions")
def wallet_transactions():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401
    
    user_role = role_name(session["role_id"])
    user_id = session["user_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if user_role == "shipper":
        # Shipper wallet transactions
        cur.execute("""
            SELECT * FROM app.shipper_wallet_transactions
            WHERE shipper_id = %s
            ORDER BY created_at DESC;
        """, (user_id,))
    elif user_role == "customer":
        # Customer wallet transactions
        cur.execute("""
            SELECT wt.* FROM app.wallet_transactions wt
            JOIN app.wallets w ON wt.wallet_id = w.wallet_id
            WHERE w.user_id = %s
            ORDER BY wt.created_at DESC;
        """, (user_id,))
    else:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Wallet not available for this role"}), 403
    
    txns = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "transactions": txns})
