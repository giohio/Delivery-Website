from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Get all shippers
cur.execute("""
    SELECT u.user_id, u.email, r.role_name 
    FROM app.users u 
    JOIN app.roles r ON u.role_id = r.role_id 
    WHERE r.role_name = 'shipper' 
    ORDER BY u.user_id;
""")
shippers = cur.fetchall()

print("\n👤 SHIPPERS:")
for s in shippers:
    print(f"  ID {s[0]}: {s[1]}")

# Get all wallets
cur.execute("SELECT shipper_id, balance FROM app.shipper_wallets ORDER BY shipper_id;")
wallets = cur.fetchall()

print("\n💰 WALLETS:")
for w in wallets:
    print(f"  Shipper {w[0]}: {w[1]:,.0f} VND")

# Find shippers without wallets
shipper_ids = {s[0] for s in shippers}
wallet_ids = {w[0] for w in wallets}
missing = shipper_ids - wallet_ids

if missing:
    print(f"\n⚠️  MISSING WALLETS FOR SHIPPERS: {missing}")
    
    # Create missing wallets
    for shipper_id in missing:
        cur.execute("""
            INSERT INTO app.shipper_wallets (shipper_id, balance)
            VALUES (%s, 0)
            ON CONFLICT (shipper_id) DO NOTHING;
        """, (shipper_id,))
    conn.commit()
    print("✅ Created missing wallets!")
else:
    print("\n✅ All shippers have wallets!")

cur.close()
conn.close()
