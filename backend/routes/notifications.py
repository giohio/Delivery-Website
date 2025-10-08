from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")

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

def push_notification(user_id, title, body):
    """Insert a notification row for a specific user"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO app.notifications (user_id, title, body, is_read, created_at)
        VALUES (%s, %s, %s, false, NOW());
    """, (user_id, title, body))
    conn.commit()
    cur.close(); conn.close()


# ---- endpoints ----

# get all notifications 
@notifications_bp.get("")
def list_notifications():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT notification_id, title, body, is_read, created_at
          FROM app.notifications
         WHERE user_id = %s
         ORDER BY created_at DESC;
    """, (session["user_id"],))
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "notifications": rows})


# mark a notification as read
@notifications_bp.put("/<int:notification_id>/read")
def mark_as_read(notification_id):
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE app.notifications
           SET is_read = true
         WHERE notification_id = %s AND user_id = %s;
    """, (notification_id, session["user_id"]))
    conn.commit()
    cur.close(); conn.close()

    return jsonify({"ok": True, "message": "Notification marked as read"})


# clear all read notifications 
@notifications_bp.delete("/clear-read")
def clear_read_notifications():
    session, err = current_session(request)
    if err:
        return jsonify({"ok": False, "error": err}), 401

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        DELETE FROM app.notifications
         WHERE user_id = %s AND is_read = true;
    """, (session["user_id"],))
    deleted = cur.rowcount
    conn.commit()
    cur.close(); conn.close()

    return jsonify({"ok": True, "deleted": deleted})
