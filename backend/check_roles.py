from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

print("=== ROLES ===")
cur.execute('SELECT role_id, role_name FROM app.roles ORDER BY role_id;')
rows = cur.fetchall()
for r in rows:
    print(f'ID: {r[0]}, Name: {r[1]}')

print("\n=== USERS (First 5) ===")
cur.execute('SELECT user_id, username, role_id FROM app.users LIMIT 5;')
rows = cur.fetchall()
for r in rows:
    print(f'UserID: {r[0]}, Username: {r[1]}, RoleID: {r[2]}')

cur.close()
conn.close()
