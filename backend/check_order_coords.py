from db import get_db_connection
import psycopg2.extras

conn = get_db_connection()
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cur.execute("""
    SELECT 
        order_id, 
        pickup_address,
        pickup_latitude, 
        pickup_longitude, 
        delivery_latitude, 
        delivery_longitude, 
        distance_km, 
        price_estimate,
        status
    FROM app.orders 
    WHERE status IN ('PENDING', 'ASSIGNED')
    LIMIT 5;
""")

rows = cur.fetchall()

print('\n📦 Sample Orders with Coordinates:')
print('=' * 80)
for r in rows:
    print(f"\nOrder #{r['order_id']} ({r['status']}):")
    print(f"  Pickup: {r['pickup_address'][:50]}...")
    print(f"  Pickup Coords: ({r['pickup_latitude']}, {r['pickup_longitude']})")
    print(f"  Delivery Coords: ({r['delivery_latitude']}, {r['delivery_longitude']})")
    print(f"  Distance: {r['distance_km']} km")
    print(f"  Price: {r['price_estimate']:,.0f}₫")

cur.close()
conn.close()
