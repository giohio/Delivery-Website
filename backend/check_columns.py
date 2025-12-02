from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'orders'
    ORDER BY ordinal_position;
""")

cols = cur.fetchall()

print('\n📋 Orders Table Columns:')
print('=' * 50)
for col in cols:
    print(f"  {col[0]:<30} {col[1]}")

cur.close()
conn.close()
