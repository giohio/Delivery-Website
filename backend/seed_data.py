import psycopg2.extras
from db import get_db_connection
from utils.auth import hash_password

ROLES = ["admin", "merchant", "shipper", "customer"]

USERS = [
    {"username": "admin", "email": "admin@example.com", "full_name": "Admin", "phone": "000000001", "password": "admin123", "role": "admin"},
    {"username": "merchant1", "email": "merchant1@example.com", "full_name": "Merchant One", "phone": "000000002", "password": "merchant123", "role": "merchant"},
    {"username": "shipper1", "email": "shipper1@example.com", "full_name": "Shipper One", "phone": "000000003", "password": "shipper123", "role": "shipper"},
    {"username": "customer1", "email": "customer1@example.com", "full_name": "Customer One", "phone": "000000004", "password": "customer123", "role": "customer"},
]

SEED_TAG = "[SEED]"


def ensure_schema():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("CREATE SCHEMA IF NOT EXISTS app;")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.roles (
                role_id SERIAL PRIMARY KEY,
                role_name VARCHAR(50) UNIQUE NOT NULL
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash TEXT,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                full_name VARCHAR(255),
                role_id INTEGER REFERENCES app.roles(role_id),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.api_tokens (
                token_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES app.users(user_id),
                token TEXT NOT NULL,
                expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                revoked BOOLEAN DEFAULT FALSE
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.orders (
                order_id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES app.users(user_id),
                merchant_id INTEGER REFERENCES app.users(user_id),
                delivery_id INTEGER,
                pickup_address TEXT NOT NULL,
                delivery_address TEXT NOT NULL,
                pickup_lat DOUBLE PRECISION,
                pickup_lng DOUBLE PRECISION,
                delivery_lat DOUBLE PRECISION,
                delivery_lng DOUBLE PRECISION,
                status VARCHAR(20) NOT NULL,
                distance_km NUMERIC(10,2),
                price_estimate NUMERIC(12,2),
                payment_method VARCHAR(20) DEFAULT 'cash',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.deliveries (
                delivery_id SERIAL PRIMARY KEY,
                shipper_id INTEGER REFERENCES app.users(user_id),
                max_capacity INTEGER,
                status VARCHAR(20) NOT NULL,
                assigned_at TIMESTAMP WITHOUT TIME ZONE,
                updated_at TIMESTAMP WITHOUT TIME ZONE,
                delivered_at TIMESTAMP WITHOUT TIME ZONE
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.payments (
                payment_id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES app.orders(order_id),
                amount NUMERIC(12,2),
                method VARCHAR(20),
                status VARCHAR(20),
                transaction_ref VARCHAR(255),
                refunded BOOLEAN DEFAULT FALSE,
                paid_at TIMESTAMP WITHOUT TIME ZONE
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.notifications (
                notification_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES app.users(user_id),
                title TEXT,
                body TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.shipper_wallets (
                shipper_id INTEGER PRIMARY KEY REFERENCES app.users(user_id),
                balance NUMERIC(12,2) DEFAULT 0,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.shipper_wallet_transactions (
                id SERIAL PRIMARY KEY,
                shipper_id INTEGER REFERENCES app.users(user_id),
                amount NUMERIC(12,2),
                type VARCHAR(20),
                ref_delivery_id INTEGER,
                note TEXT,
                balance_after NUMERIC(12,2),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.ratings (
                rating_id SERIAL PRIMARY KEY,
                delivery_id INTEGER REFERENCES app.deliveries(delivery_id),
                customer_id INTEGER REFERENCES app.users(user_id),
                shipper_id INTEGER REFERENCES app.users(user_id),
                score INTEGER,
                comment TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.tracking_events (
                id SERIAL PRIMARY KEY,
                delivery_id INTEGER REFERENCES app.deliveries(delivery_id),
                event_type VARCHAR(30),
                status VARCHAR(30),
                description TEXT,
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS app.shipper_profiles (
                shipper_id INTEGER PRIMARY KEY REFERENCES app.users(user_id),
                rating_count INTEGER DEFAULT 0,
                rating_avg NUMERIC(4,2) DEFAULT 0
            );
            """
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def seed_roles():
    ensure_schema()
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT role_name FROM app.roles;")
        existing = {r[0] for r in cur.fetchall()}
        for role in ROLES:
            if role not in existing:
                cur.execute("INSERT INTO app.roles (role_name) VALUES (%s);", (role,))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def get_or_create_user(u):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM app.users WHERE email = %s OR username = %s;", (u["email"], u["username"]))
        row = cur.fetchone()
        if row:
            return row["user_id"], row
        cur.execute("SELECT role_id FROM app.roles WHERE role_name = %s;", (u["role"],))
        role = cur.fetchone()
        role_id = role["role_id"]
        pwd_hash = hash_password(u["password"]) if u.get("password") else None
        cur.execute(
            """
            INSERT INTO app.users (username, password_hash, email, phone, full_name, role_id, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            RETURNING user_id;
            """,
            (u["username"], pwd_hash, u["email"], u["phone"], u["full_name"], role_id)
        )
        user_id = cur.fetchone()["user_id"]
        conn.commit()
        return user_id, None
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def ensure_shipper_wallet(shipper_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM app.shipper_wallets WHERE shipper_id = %s;", (shipper_id,))
        if not cur.fetchone():
            cur.execute(
                """
                INSERT INTO app.shipper_wallets (shipper_id, balance, updated_at)
                VALUES (%s, 0, NOW());
                """,
                (shipper_id,)
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def ensure_shipper_profile(shipper_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM app.shipper_profiles WHERE shipper_id = %s;", (shipper_id,))
        if not cur.fetchone():
            cur.execute(
                """
                INSERT INTO app.shipper_profiles (shipper_id, rating_count, rating_avg)
                VALUES (%s, 0, 0);
                """,
                (shipper_id,)
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def create_order_if_absent(customer_id, merchant_id, pickup_address, delivery_address, distance_km, price_estimate):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            """
            SELECT order_id FROM app.orders
             WHERE customer_id = %s AND merchant_id IS NOT DISTINCT FROM %s
               AND pickup_address = %s AND delivery_address = %s;
            """,
            (customer_id, merchant_id, pickup_address, delivery_address)
        )
        r = cur.fetchone()
        if r:
            return r["order_id"]
        cur.execute(
            """
            INSERT INTO app.orders
                (customer_id, merchant_id, pickup_address, delivery_address, status, distance_km, price_estimate)
            VALUES (%s, %s, %s, %s, 'PENDING', %s, %s)
            RETURNING order_id;
            """,
            (customer_id, merchant_id, pickup_address, delivery_address, distance_km, price_estimate)
        )
        oid = cur.fetchone()["order_id"]
        conn.commit()
        return oid
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def create_delivery_with_orders_if_needed(shipper_id, order_ids, max_capacity):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT DISTINCT delivery_id FROM app.orders WHERE order_id = ANY(%s) AND delivery_id IS NOT NULL;", (order_ids,))
        rows = cur.fetchall()
        if rows:
            return rows[0]["delivery_id"]
        cur.execute(
            """
            INSERT INTO app.deliveries (shipper_id, max_capacity, status, assigned_at, updated_at)
            VALUES (%s, %s, 'ASSIGNED', NOW(), NOW())
            RETURNING delivery_id;
            """,
            (shipper_id, max_capacity)
        )
        did = cur.fetchone()["delivery_id"]
        cur.execute(
            """
            UPDATE app.orders
               SET delivery_id = %s, status = 'ASSIGNED'
             WHERE order_id = ANY(%s);
            """,
            (did, order_ids)
        )
        conn.commit()
        return did
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def add_payment_if_absent(order_id, amount, method, transaction_ref):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT 1 FROM app.payments WHERE order_id = %s AND transaction_ref = %s;", (order_id, transaction_ref))
        if cur.fetchone():
            cur.close(); conn.close()
            return
        status = "PENDING" if method == "CASH" else "SUCCESS"
        cur.execute(
            """
            INSERT INTO app.payments (order_id, amount, method, status, transaction_ref, refunded, paid_at)
            VALUES (%s, %s, %s, %s, %s, false, CASE WHEN %s='SUCCESS' THEN NOW() ELSE NULL END)
            RETURNING payment_id;
            """,
            (order_id, amount, method, status, transaction_ref, status)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def append_tracking_event(delivery_id, event_type, status=None, note=None, lat=None, lng=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO app.tracking_events (delivery_id, event_type, status, description, lat, lng)
            VALUES (%s, %s, %s, %s, %s, %s);
            """,
            (delivery_id, event_type, status, note, lat, lng)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def add_rating_if_absent(delivery_id, customer_id, shipper_id, score, comment):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT 1 FROM app.ratings WHERE delivery_id = %s AND customer_id = %s;
            """,
            (delivery_id, customer_id)
        )
        if cur.fetchone():
            cur.close(); conn.close()
            return
        cur.execute(
            """
            INSERT INTO app.ratings (delivery_id, customer_id, shipper_id, score, comment, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW());
            """,
            (delivery_id, customer_id, shipper_id, score, comment)
        )
        cur.execute(
            """
            UPDATE app.shipper_profiles
               SET rating_count = rating_count + 1,
                   rating_avg = ((rating_avg * (rating_count) + %s) / (rating_count + 1))
             WHERE shipper_id = %s;
            """,
            (score, shipper_id)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def push_notification(user_id, title, body):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT 1 FROM app.notifications WHERE user_id = %s AND title = %s AND body = %s;
            """,
            (user_id, title, body)
        )
        if cur.fetchone():
            cur.close(); conn.close()
            return
        cur.execute(
            """
            INSERT INTO app.notifications (user_id, title, body, is_read, created_at)
            VALUES (%s, %s, %s, false, NOW());
            """,
            (user_id, title, body)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()


def main():
    seed_roles()
    role_users = {}
    created_users = []
    for u in USERS:
        uid, existing_row = get_or_create_user(u)
        role_users[u["role"]] = uid
        created_users.append({"role": u["role"], "user_id": uid, "existing": bool(existing_row)})
    shipper_id = role_users["shipper"]
    ensure_shipper_wallet(shipper_id)
    ensure_shipper_profile(shipper_id)
    customer_id = role_users["customer"]
    merchant_id = role_users["merchant"]
    o1 = create_order_if_absent(customer_id, merchant_id, f"{SEED_TAG} 123 Start St", f"{SEED_TAG} 456 End Ave", 5.5, 100000)
    o2 = create_order_if_absent(customer_id, merchant_id, f"{SEED_TAG} 789 Alpha Rd", f"{SEED_TAG} 321 Beta Blvd", 3.2, 75000)
    did = create_delivery_with_orders_if_needed(shipper_id, [o1, o2], 10)
    add_payment_if_absent(o1, 100000, "CASH", f"{SEED_TAG}-CASH-{o1}")
    add_payment_if_absent(o2, 75000, "BANK", f"{SEED_TAG}-BANK-{o2}")
    append_tracking_event(did, "STATUS", "ASSIGNED", f"{SEED_TAG} Delivery created")
    append_tracking_event(did, "LOCATION", None, f"{SEED_TAG} Pickup scanned", 10.762622, 106.660172)
    push_notification(customer_id, f"{SEED_TAG} Order Created", f"Your order #{o1} is created")
    push_notification(customer_id, f"{SEED_TAG} Order Created", f"Your order #{o2} is created")
    add_rating_if_absent(did, customer_id, shipper_id, 5, f"{SEED_TAG} Great job")
    print({
        "ok": True,
        "users": created_users,
        "orders": [o1, o2],
        "delivery_id": did,
    })


if __name__ == "__main__":
    main()
