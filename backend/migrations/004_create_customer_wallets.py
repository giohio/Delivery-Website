"""
Migration: Create customer wallets and wallet transactions tables
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def up():
    """Create customer wallet tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Create wallets table for customers
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.wallets (
                wallet_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
                balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            );
        """)
        
        # Create wallet transactions table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.wallet_transactions (
                transaction_id SERIAL PRIMARY KEY,
                wallet_id INTEGER NOT NULL REFERENCES app.wallets(wallet_id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes for better performance
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_wallets_user_id 
            ON app.wallets(user_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id 
            ON app.wallet_transactions(wallet_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at 
            ON app.wallet_transactions(created_at DESC);
        """)
        
        conn.commit()
        print("✅ Customer wallets tables created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating customer wallets tables: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def down():
    """Drop customer wallet tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DROP TABLE IF EXISTS app.wallet_transactions CASCADE;")
        cur.execute("DROP TABLE IF EXISTS app.wallets CASCADE;")
        
        conn.commit()
        print("✅ Customer wallets tables dropped successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error dropping customer wallets tables: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Running migration: Create customer wallets tables...")
    up()
