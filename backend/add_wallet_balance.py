import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_db_connection

def add_balance_to_customer(amount=700000):
    """Add balance to the first customer's wallet"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get first customer (role_id = 1 is customer)
        cur.execute("""
            SELECT u.user_id, u.email 
            FROM app.users u
            JOIN app.roles r ON u.role_id = r.role_id
            WHERE r.role_name = 'customer' 
            ORDER BY u.user_id LIMIT 1;
        """)
        customer = cur.fetchone()
        
        if not customer:
            print("No customer found")
            return
        
        customer_id = customer[0]
        email = customer[1]
        
        # Get or create wallet
        cur.execute("SELECT wallet_id, balance FROM app.wallets WHERE user_id = %s;", (customer_id,))
        wallet = cur.fetchone()
        
        if not wallet:
            # Create wallet
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance, created_at, updated_at)
                VALUES (%s, 0, NOW(), NOW())
                RETURNING wallet_id, balance;
            """, (customer_id,))
            wallet = cur.fetchone()
            print(f"Created new wallet for customer {email}")
        
        wallet_id = wallet[0]
        old_balance = float(wallet[1])
        new_balance = old_balance + amount
        
        # Update balance
        cur.execute("""
            UPDATE app.wallets 
            SET balance = %s, updated_at = NOW()
            WHERE wallet_id = %s;
        """, (new_balance, wallet_id))
        
        # Create transaction record
        cur.execute("""
            INSERT INTO app.wallet_transactions (wallet_id, amount, type, description, created_at)
            VALUES (%s, %s, 'CREDIT', %s, NOW());
        """, (wallet_id, amount, f"Test top-up for wallet testing"))
        
        conn.commit()
        
        print(f"\n✓ Successfully added {amount:,.0f}₫ to customer wallet")
        print(f"  Customer: {email} (ID: {customer_id})")
        print(f"  Old balance: {old_balance:,.0f}₫")
        print(f"  New balance: {new_balance:,.0f}₫")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Failed to add balance: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_balance_to_customer(700000)
