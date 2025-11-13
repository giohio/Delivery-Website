from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Check shipper profiles
cur.execute('SELECT * FROM app.shipper_profiles;')
rows = cur.fetchall()
print(f'\n=== Shipper Profiles ({len(rows)} records) ===')
for r in rows:
    print(f'Shipper ID: {r[0]}, Count: {r[1]}, Avg: {r[2]}')

# Check ratings
cur.execute('SELECT * FROM app.ratings;')
ratings = cur.fetchall()
print(f'\n=== Ratings ({len(ratings)} records) ===')
for r in ratings:
    print(f'Rating ID: {r[0]}, Delivery: {r[1]}, Customer: {r[2]}, Shipper: {r[3]}, Score: {r[4]}')

cur.close()
conn.close()
