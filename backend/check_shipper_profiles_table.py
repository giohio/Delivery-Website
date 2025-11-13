from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Check shipper_profiles table structure
cur.execute("""
    SELECT column_name, data_type, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'shipper_profiles' 
    ORDER BY ordinal_position;
""")

columns = cur.fetchall()

print("\n📋 shipper_profiles table columns:")
print("=" * 60)
for col in columns:
    col_name = col[0]
    data_type = col[1]
    max_length = f"({col[2]})" if col[2] else ""
    print(f"  {col_name:<30} {data_type}{max_length}")

print("\n✅ Total columns:", len(columns))

cur.close()
conn.close()
