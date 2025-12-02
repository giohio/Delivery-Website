from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Check if coupons table exists
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'coupons'
    ORDER BY ordinal_position;
""")

columns = cur.fetchall()

if columns:
    print("\n📋 Coupons Table Structure:")
    print("=" * 50)
    for col in columns:
        print(f"  {col[0]:<30} {col[1]}")
    
    # Get sample data
    cur.execute("SELECT * FROM app.coupons LIMIT 5;")
    coupons = cur.fetchall()
    
    print(f"\n💳 Sample Coupons ({len(coupons)}):")
    print("=" * 50)
    for coupon in coupons:
        print(f"  {coupon}")
else:
    print("❌ Coupons table does not exist!")

cur.close()
conn.close()
