from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Check users table structure
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'users'
    ORDER BY ordinal_position;
""")

cols = cur.fetchall()

print('\n📋 Users Table Columns:')
print('=' * 50)
for col in cols:
    print(f"  {col[0]:<30} {col[1]}")

# Get sample user
cur.execute("SELECT * FROM app.users LIMIT 1;")
user = cur.fetchone()
if user:
    print('\n📝 Sample User Data:')
    print('=' * 50)
    for key in user.keys():
        print(f"  {key:<30} {user[key]}")

cur.close()
conn.close()
