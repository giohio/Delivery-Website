from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

cur.execute("""
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'orders'
    ORDER BY ordinal_position;
""")

cols = cur.fetchall()

print('\n📋 Orders Table Columns:')
print('=' * 80)
for col in cols:
    nullable = "NULL" if col[2] == "YES" else "NOT NULL"
    default = f" DEFAULT {col[3]}" if col[3] else ""
    print(f"  {col[0]:<30} {col[1]:<25} {nullable}{default}")

cur.close()
conn.close()
