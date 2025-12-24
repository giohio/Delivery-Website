from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt

ratings_bp = Blueprint("ratings", __name__, url_prefix="/ratings")

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

# Customers leave ratings for orders
@ratings_bp.post("/<int:delivery_id>")
def leave_rating(delivery_id):
    session, err = current_session(request)
    if err:
      return jsonify({"ok": False, "error": err}), 401
    
    user_role = role_name(session["role_id"])
    print(f"[DEBUG] leave_rating - user_id: {session['user_id']}, role_id: {session['role_id']}, role_name: {user_role}")
    
    if user_role != "customer":  
      return jsonify({"ok": False, "error": f"Only customers can leave ratings. Your role: {user_role}"}), 403
    data = request.get_json()
    score = data.get("score")
    comment = data.get("comment", "")
    if not score or not (1 <= int(score) <= 5):
        return jsonify({"ok": False, "error": "Score must be between 1 and 5"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    #get delivery infor
    cur.execute("SELECT * FROM app.deliveries WHERE delivery_id = %s;", (delivery_id,))
    delivery = cur.fetchone()
    if not delivery:
       return jsonify({"ok": False, "error": "Delivery not found"}), 404
    # ensure customer belongs to this delivery (via orders)
    cur.execute("""
        SELECT 1 FROM app.orders
         WHERE delivery_id = %s AND customer_id = %s;
    """, (delivery_id, session["user_id"]))
    if not cur.fetchone():
        return jsonify({"ok": False, "error": "You are not part of this delivery"}), 403

    # check if rating already exists
    cur.execute("""
        SELECT * FROM app.ratings WHERE delivery_id = %s AND customer_id = %s;
    """, (delivery_id, session["user_id"]))
    if cur.fetchone():
        return jsonify({"ok": False, "error": "You already rated this delivery"}), 409

    # insert rating
    cur.execute("""
        INSERT INTO app.ratings (delivery_id, customer_id, shipper_id, score, comment, created_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        RETURNING *;
    """, (delivery_id, session["user_id"], delivery["shipper_id"], score, comment))
    rating = cur.fetchone()

    # update shipper profile stats - ensure profile exists first
    cur.execute("""
        INSERT INTO app.shipper_profiles (shipper_id, rating_count, rating_avg)
        VALUES (%s, 0, 0)
        ON CONFLICT (shipper_id) DO NOTHING;
    """, (delivery["shipper_id"],))
    
    cur.execute("""
        UPDATE app.shipper_profiles
           SET rating_count = rating_count + 1,
               rating_avg = ((rating_avg * rating_count + %s) / (rating_count + 1))
         WHERE shipper_id = %s;
    """, (score, delivery["shipper_id"]))

    conn.commit()
    cur.close(); conn.close()

    return jsonify({"ok": True, "rating": rating})


# get all ratings for a shipper
@ratings_bp.get("/shipper/<int:shipper_id>")
def shipper_ratings(shipper_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.ratings WHERE shipper_id = %s ORDER BY created_at DESC;", (shipper_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "ratings": rows})


#get rating for a delivery
@ratings_bp.get("/delivery/<int:delivery_id>")
def delivery_rating(delivery_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM app.ratings WHERE delivery_id = %s;", (delivery_id,))
    rating = cur.fetchone()
    cur.close(); conn.close()

    if not rating:
        return jsonify({"ok": False, "error": "No rating found"}), 404

    return jsonify({"ok": True, "rating": rating})
