from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

print("\n📋 Creating wallets for all customers without wallets:")
print("=" * 70)

# Get customers without wallets
cur.execute("""
    SELECT u.user_id, u.email, u.full_name
    FROM app.users u
    JOIN app.roles r ON u.role_id = r.role_id
    WHERE r.role_name = 'customer'
    AND u.user_id NOT IN (SELECT user_id FROM app.wallets)
    ORDER BY u.user_id;
""")
customers = cur.fetchall()

if not customers:
    print("  ✓ All customers already have wallets!")
else:
    for c in customers:
        user_id, email, full_name = c
        
        # Create wallet with initial balance
        initial_balance = 1400000  # Same as customer1 for testing
        cur.execute("""
            INSERT INTO app.wallets (user_id, balance, created_at, updated_at)
            VALUES (%s, %s, NOW(), NOW())
            RETURNING wallet_id;
        """, (user_id, initial_balance))
        
        wallet_id = cur.fetchone()[0]
        
        # Create initial transaction
        cur.execute("""
            INSERT INTO app.wallet_transactions (wallet_id, amount, type, description, created_at)
            VALUES (%s, %s, 'CREDIT', %s, NOW());
        """, (wallet_id, initial_balance, "Initial balance for testing"))
        
        print(f"  ✓ Created wallet {wallet_id} for {email} with {initial_balance:,.0f}₫")

    conn.commit()
    print(f"\n✓ Successfully created {len(customers)} wallets")

cur.close()
conn.close()
