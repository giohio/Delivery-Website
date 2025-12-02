from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Get all users with customer role
print("\n📋 All Customer Users:")
print("=" * 70)
cur.execute("""
    SELECT u.user_id, u.email, u.full_name, r.role_name
    FROM app.users u
    JOIN app.roles r ON u.role_id = r.role_id
    WHERE r.role_name = 'customer'
    ORDER BY u.user_id;
""")
customers = cur.fetchall()

for c in customers:
    user_id, email, full_name, role = c
    print(f"  ID: {user_id}, Email: {email}, Name: {full_name}")
    
    # Check if they have a wallet
    cur.execute("SELECT wallet_id, balance FROM app.wallets WHERE user_id = %s;", (user_id,))
    wallet = cur.fetchone()
    if wallet:
        print(f"    ✓ Wallet: {wallet[0]}, Balance: {wallet[1]:,.0f}₫")
    else:
        print(f"    ✗ No wallet")
    print()

cur.close()
conn.close()
