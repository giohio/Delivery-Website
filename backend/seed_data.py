import psycopg2.extras
from db import get_db_connection
from utils.auth import hash_password

ROLES = ["admin", "merchant", "shipper", "customer"]

USERS = [
    {"username": "admin", "email": "admin@example.com", "full_name": "Admin User", "phone": "0900000001", "password": "admin123", "role": "admin"},
    
    # Merchants
    {"username": "merchant1", "email": "merchant1@example.com", "full_name": "Saigon Express", "phone": "0900000002", "password": "merchant123", "role": "merchant"},
    {"username": "merchant2", "email": "merchant2@example.com", "full_name": "Hanoi Logistics", "phone": "0900000003", "password": "merchant123", "role": "merchant"},
    {"username": "merchant3", "email": "merchant3@example.com", "full_name": "Da Nang Cargo", "phone": "0900000004", "password": "merchant123", "role": "merchant"},
    
    # Shippers
    {"username": "shipper1", "email": "shipper1@example.com", "full_name": "Nguyen Van A", "phone": "0900000005", "password": "shipper123", "role": "shipper"},
    {"username": "shipper2", "email": "shipper2@example.com", "full_name": "Tran Thi B", "phone": "0900000006", "password": "shipper123", "role": "shipper"},
    {"username": "shipper3", "email": "shipper3@example.com", "full_name": "Le Van C", "phone": "0900000007", "password": "shipper123", "role": "shipper"},
    {"username": "shipper4", "email": "shipper4@example.com", "full_name": "Pham Thi D", "phone": "0900000008", "password": "shipper123", "role": "shipper"},
    {"username": "shipper5", "email": "shipper5@example.com", "full_name": "Hoang Van E", "phone": "0900000009", "password": "shipper123", "role": "shipper"},
    
    # Customers
    {"username": "customer1", "email": "customer1@example.com", "full_name": "Vo Van F", "phone": "0900000010", "password": "customer123", "role": "customer"},
    {"username": "customer2", "email": "customer2@example.com", "full_name": "Do Thi G", "phone": "0900000011", "password": "customer123", "role": "customer"},
    {"username": "customer3", "email": "customer3@example.com", "full_name": "Bui Van H", "phone": "0900000012", "password": "customer123", "role": "customer"},
    {"username": "customer4", "email": "customer4@example.com", "full_name": "Duong Thi I", "phone": "0900000013", "password": "customer123", "role": "customer"},
    {"username": "customer5", "email": "customer5@example.com", "full_name": "Ngo Van K", "phone": "0900000014", "password": "customer123", "role": "customer"},
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
                service_type VARCHAR(20) DEFAULT 'bike',
                package_size VARCHAR(20) DEFAULT 'small',
                pickup_contact_name VARCHAR(255),
                pickup_contact_phone VARCHAR(20),
                delivery_contact_name VARCHAR(255),
                delivery_contact_phone VARCHAR(20),
                notes TEXT,
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


def create_order_if_absent(customer_id, merchant_id, pickup_address, delivery_address, distance_km, price_estimate, 
                          pickup_lat=None, pickup_lng=None, delivery_lat=None, delivery_lng=None,
                          service_type='bike', package_size='small', payment_method='cash'):
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
                (customer_id, merchant_id, pickup_address, delivery_address, 
                 pickup_lat, pickup_lng, delivery_lat, delivery_lng,
                 status, distance_km, price_estimate, 
                 service_type, package_size,
                 pickup_contact_name, pickup_contact_phone,
                 delivery_contact_name, delivery_contact_phone,
                 notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PENDING', %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING order_id;
            """,
            (customer_id, merchant_id, pickup_address, delivery_address,
             pickup_lat, pickup_lng, delivery_lat, delivery_lng,
             distance_km, price_estimate,
             service_type, package_size,
             f"Sender {customer_id}", f"090{customer_id:07d}",
             f"Receiver {merchant_id}", f"091{merchant_id:07d}",
             f"{SEED_TAG} Sample order notes")
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
    
    # Create all users
    role_users = {"merchant": [], "shipper": [], "customer": []}
    admin_id = None
    
    for u in USERS:
        uid, existing_row = get_or_create_user(u)
        if u["role"] == "admin":
            admin_id = uid
        elif u["role"] in role_users:
            role_users[u["role"]].append(uid)
    
    # Setup shipper profiles and wallets
    for shipper_id in role_users["shipper"]:
        ensure_shipper_wallet(shipper_id)
        ensure_shipper_profile(shipper_id)
    
    print(f"✅ Created {len(USERS)} users")
    print(f"   - Admin: {admin_id}")
    print(f"   - Merchants: {len(role_users['merchant'])}")
    print(f"   - Shippers: {len(role_users['shipper'])}")
    print(f"   - Customers: {len(role_users['customer'])}")
    
    # Sample addresses in Vietnam
    addresses = [
        # Ho Chi Minh City
        {"pickup": "54 Nguyen Hue, District 1, HCMC", "delivery": "123 Le Loi, District 1, HCMC", "pickup_lat": 10.7769, "pickup_lng": 106.7009, "delivery_lat": 10.7741, "delivery_lng": 106.6990, "distance": 2.5},
        {"pickup": "280 An Duong Vuong, District 5, HCMC", "delivery": "39 Tran Hung Dao, District 1, HCMC", "pickup_lat": 10.7558, "pickup_lng": 106.6623, "delivery_lat": 10.7679, "delivery_lng": 106.6938, "distance": 4.2},
        {"pickup": "Tan Son Nhat Airport, HCMC", "delivery": "Bitexco Tower, HCMC", "pickup_lat": 10.8188, "pickup_lng": 106.6519, "delivery_lat": 10.7718, "delivery_lng": 106.7044, "distance": 7.8},
        {"pickup": "Ben Thanh Market, District 1, HCMC", "delivery": "Thu Duc Market, Thu Duc, HCMC", "pickup_lat": 10.7726, "pickup_lng": 106.6980, "delivery_lat": 10.8505, "delivery_lng": 106.7691, "distance": 12.5},
        {"pickup": "Notre Dame Cathedral, HCMC", "delivery": "Independence Palace, HCMC", "pickup_lat": 10.7797, "pickup_lng": 106.6990, "delivery_lat": 10.7769, "delivery_lng": 106.6955, "distance": 1.2},
        
        # Hanoi
        {"pickup": "Hoan Kiem Lake, Hanoi", "delivery": "Old Quarter, Hanoi", "pickup_lat": 21.0285, "pickup_lng": 105.8542, "delivery_lat": 21.0352, "delivery_lng": 105.8516, "distance": 1.8},
        {"pickup": "West Lake, Hanoi", "delivery": "Dong Xuan Market, Hanoi", "pickup_lat": 21.0583, "pickup_lng": 105.8283, "delivery_lat": 21.0352, "delivery_lng": 105.8480, "distance": 3.5},
        {"pickup": "Temple of Literature, Hanoi", "delivery": "Ho Chi Minh Mausoleum, Hanoi", "pickup_lat": 21.0277, "pickup_lng": 105.8355, "delivery_lat": 21.0366, "delivery_lng": 105.8345, "distance": 2.1},
        
        # Da Nang
        {"pickup": "Dragon Bridge, Da Nang", "delivery": "My Khe Beach, Da Nang", "pickup_lat": 16.0611, "pickup_lng": 108.2275, "delivery_lat": 16.0398, "delivery_lng": 108.2429, "distance": 3.8},
        {"pickup": "Da Nang Airport", "delivery": "Han Market, Da Nang", "pickup_lat": 16.0439, "pickup_lng": 108.1993, "delivery_lat": 16.0678, "delivery_lng": 108.2208, "distance": 4.5},
    ]
    
    service_types = ["bike", "car", "truck"]
    package_sizes = ["small", "medium", "large"]
    payment_methods = ["cash", "credit_card", "e_wallet", "bank_transfer"]
    statuses = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELED"]
    
    created_orders = []
    created_deliveries = []
    
    # Create diverse orders
    order_count = 0
    for customer_id in role_users["customer"]:
        merchant_id = role_users["merchant"][order_count % len(role_users["merchant"])]
        
        # Each customer creates 3-5 orders
        num_orders = 3 + (order_count % 3)
        for i in range(num_orders):
            addr = addresses[order_count % len(addresses)]
            service = service_types[order_count % len(service_types)]
            pkg_size = package_sizes[order_count % len(package_sizes)]
            payment = payment_methods[order_count % len(payment_methods)]
            
            # Calculate price
            base_prices = {"bike": 10000, "car": 20000, "truck": 50000}
            km_rates = {"bike": 5000, "car": 8000, "truck": 15000}
            pkg_surcharges = {"small": 0, "medium": 5000, "large": 10000}
            
            price = base_prices[service] + (addr["distance"] * km_rates[service]) + pkg_surcharges[pkg_size]
            
            order_id = create_order_if_absent(
                customer_id, 
                merchant_id,
                addr["pickup"],
                addr["delivery"],
                addr["distance"],
                int(price),
                addr["pickup_lat"],
                addr["pickup_lng"],
                addr["delivery_lat"],
                addr["delivery_lng"],
                service,
                pkg_size,
                payment
            )
            
            created_orders.append(order_id)
            
            # Create payment for completed orders
            if order_count % 3 != 0:  # 66% have payments
                add_payment_if_absent(order_id, int(price), payment.upper(), f"{SEED_TAG}-{payment}-{order_id}")
            
            order_count += 1
    
    print(f"✅ Created {len(created_orders)} orders with diverse data")
    
    # Assign orders to deliveries
    delivery_count = 0
    for i in range(0, len(created_orders), 3):  # Group orders in batches of 3
        batch = created_orders[i:i+3]
        if not batch:
            continue
            
        shipper_id = role_users["shipper"][delivery_count % len(role_users["shipper"])]
        delivery_id = create_delivery_with_orders_if_needed(shipper_id, batch, 10)
        created_deliveries.append(delivery_id)
        
        # Add tracking events for some deliveries
        if delivery_count % 2 == 0:
            append_tracking_event(delivery_id, "STATUS", "ASSIGNED", f"{SEED_TAG} Delivery assigned to shipper")
            append_tracking_event(delivery_id, "LOCATION", None, f"{SEED_TAG} At pickup location", 10.7769, 106.7009)
            
            # Some are completed with ratings
            if delivery_count % 3 == 0:
                customer_id = role_users["customer"][delivery_count % len(role_users["customer"])]
                rating_score = 3 + (delivery_count % 3)  # Ratings 3-5
                add_rating_if_absent(
                    delivery_id, 
                    customer_id, 
                    shipper_id, 
                    rating_score,
                    f"{SEED_TAG} {'Excellent' if rating_score == 5 else 'Good' if rating_score == 4 else 'Average'} service!"
                )
        
        delivery_count += 1
    
    print(f"✅ Created {len(created_deliveries)} deliveries")
    
    # Create notifications for all users
    notif_count = 0
    for customer_id in role_users["customer"]:
        push_notification(customer_id, "Welcome!", "Thank you for joining our delivery service")
        push_notification(customer_id, "Order Update", "Your recent order has been assigned to a shipper")
        notif_count += 2
    
    for shipper_id in role_users["shipper"]:
        push_notification(shipper_id, "New Delivery", "You have new deliveries to pick up")
        push_notification(shipper_id, "Earnings Update", "Your earnings have been updated")
        notif_count += 2
    
    for merchant_id in role_users["merchant"]:
        push_notification(merchant_id, "Welcome!", "Start creating orders for your customers")
        push_notification(merchant_id, "Order Status", "Your orders are being processed")
        notif_count += 2
    
    print(f"✅ Created {notif_count} notifications")
    
    print("\n" + "="*50)
    print("🎉 SEED DATA COMPLETED!")
    print("="*50)
    print(f"Total Users: {len(USERS)}")
    print(f"Total Orders: {len(created_orders)}")
    print(f"Total Deliveries: {len(created_deliveries)}")
    print(f"Total Notifications: {notif_count}")
    print("="*50)


if __name__ == "__main__":
    main()
