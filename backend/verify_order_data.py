from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Count orders with coordinates
cur.execute('SELECT COUNT(*) FROM app.orders WHERE pickup_lat IS NOT NULL;')
count_with_coords = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM app.orders;')
total_orders = cur.fetchone()[0]

print(f'\n📊 Orders Data Status:')
print(f'  Total orders: {total_orders}')
print(f'  Orders with coordinates: {count_with_coords}')
print(f'  Orders without coordinates: {total_orders - count_with_coords}')

# Show sample with coordinates
cur.execute("""
    SELECT order_id, pickup_address, pickup_lat, pickup_lng, 
           delivery_lat, delivery_lng, distance_km, price_estimate
    FROM app.orders 
    WHERE pickup_lat IS NOT NULL 
    LIMIT 3;
""")

print('\n📍 Sample Orders with Coordinates:')
for row in cur.fetchall():
    print(f'  Order #{row[0]}: distance={row[6]}km, price={row[7]:,.0f}₫')
    print(f'    Pickup: ({row[2]}, {row[3]})')
    print(f'    Delivery: ({row[4]}, {row[5]})')

cur.close()
conn.close()
