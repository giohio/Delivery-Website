from flask import Blueprint, request, jsonify
from db import get_db_connection
import psycopg2.extras
from utils.auth import decode_jwt
import os, requests, math
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

def haversine(lat1, lon1, lat2, lon2):
    """Return distance (km) between two points (lat, lon)."""
    R = 6371  # Earth radius (km)
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(d_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_weather_by_coords(lat, lon):
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return None, "Missing weather API key"
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        res = requests.get(url)
        data = res.json()
        if res.status_code != 200:
            return None, data.get("message", "Weather API error")
        weather = data["weather"][0]["main"].lower()
        return weather, None
    except Exception as e:
        return None, str(e)

def calculate_price(distance_km, weather):
    base_fare = 10000
    rate_per_km = 5000
    weather_surcharge = 0

    if weather in ["rain", "drizzle"]:
        weather_surcharge = 5000
    elif weather in ["thunderstorm"]:
        weather_surcharge = 10000
    elif weather in ["snow"]:
        weather_surcharge = 8000

    return base_fare + (distance_km * rate_per_km) + weather_surcharge

# ---- endpoints ----

# create new order
@orders_bp.post("")
def create_order():
    #authentication
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"ok": False, "error": "Missing Bearer token"}), 401
    token = auth.split(" ", 1)[1]
    payload = decode_jwt(token)
    customer_id = int(payload["sub"])

    #parse request
    data = request.get_json(force=True)
    pickup_address = data.get("pickup_address")
    delivery_address = data.get("delivery_address")
    merchant_id = data.get("merchant_id")  # Optional, can be None for customer direct orders
    pickup_lat = data.get("pickup_lat")
    pickup_lng = data.get("pickup_lng")
    delivery_lat = data.get("delivery_lat")
    delivery_lng = data.get("delivery_lng")

    if not all([pickup_address, delivery_address, pickup_lat is not None, pickup_lng is not None, delivery_lat is not None, delivery_lng is not None]):
        return jsonify({"ok": False, "error": "Missing address or coordinates"}), 400

    # Convert coordinates to float after validation
    try:
        pickup_lat = float(pickup_lat)
        pickup_lng = float(pickup_lng)
        delivery_lat = float(delivery_lat)
        delivery_lng = float(delivery_lng)
    except (ValueError, TypeError):
        return jsonify({"ok": False, "error": "Invalid coordinate format"}), 400

    #distance
    distance_km = round(haversine(pickup_lat, pickup_lng, delivery_lat, delivery_lng), 2)

    #Get weather
    weather, err = get_weather_by_coords(pickup_lat, pickup_lng)
    if err:
        weather = "clear"

    price_estimate = calculate_price(distance_km, weather)

    #Save
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        INSERT INTO app.orders
            (customer_id, merchant_id, pickup_address, delivery_address,
             pickup_lat, pickup_lng, delivery_lat, delivery_lng,
             status, distance_km, price_estimate)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PENDING', %s, %s)
        RETURNING order_id, customer_id, merchant_id, pickup_address, delivery_address,
                  distance_km, price_estimate, status, created_at;
    """, (customer_id, merchant_id, pickup_address, delivery_address,
          pickup_lat, pickup_lng, delivery_lat, delivery_lng,
          distance_km, price_estimate))
    order = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()

    return jsonify({
        "ok": True,
        "order": order,
        "weather": weather,
        "price_formula": "base + km*rate + weather_surcharge"
    }), 201


# List orders for current user


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
    if rn not in ("admin", "customer", "shipper"):
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

@orders_bp.get("")
def list_orders():
    """
    GET /orders
    - Admin: see all orders
    - Merchant: see orders that belong to their merchant_id
    - Customer: see only their own orders
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"ok": False, "error": "Missing Bearer token"}), 401
    token = auth.split(" ", 1)[1]

    try:
        payload = decode_jwt(token)
        user_id = int(payload["sub"])
        role_id = int(payload["role_id"])
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT role_name FROM app.roles WHERE role_id = %s;", (role_id,))
    role_row = cur.fetchone()
    role_name = role_row["role_name"] if role_row else None

    if not role_name:
        cur.close(); conn.close()
        return jsonify({"ok": False, "error": "Invalid role"}), 403

    if role_name == "admin":
        # merchants are stored as users (role 'merchant'), join to users to get merchant name
        cur.execute("""
            SELECT o.*, c.full_name AS customer_name, m.full_name AS merchant_name
            FROM app.orders o
            LEFT JOIN app.users c ON o.customer_id = c.user_id
            LEFT JOIN app.users m ON o.merchant_id = m.user_id
            ORDER BY o.created_at DESC;
        """)
    elif role_name == "merchant":
        # merchant users show orders where merchant_id equals their user_id
        cur.execute("""
            SELECT o.*, c.full_name AS customer_name
            FROM app.orders o
            LEFT JOIN app.users c ON o.customer_id = c.user_id
            WHERE o.merchant_id = %s
            ORDER BY o.created_at DESC;
        """, (user_id,))
    else:
        # customer: include merchant name from users table
        cur.execute("""
            SELECT o.*, m.full_name AS merchant_name
            FROM app.orders o
            LEFT JOIN app.users m ON o.merchant_id = m.user_id
            WHERE o.customer_id = %s
            ORDER BY o.created_at DESC;
        """, (user_id,))

    orders = cur.fetchall()
    cur.close(); conn.close()

    return jsonify({"ok": True, "orders": orders})
