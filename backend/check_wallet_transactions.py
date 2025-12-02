"""
Script to check wallet transactions in database
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_db_connection
import psycopg2.extras

def check_transactions():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    print("\n=== CUSTOMER WALLETS ===")
    cur.execute("""
        SELECT w.wallet_id, w.user_id, u.email, w.balance, w.created_at
        FROM app.wallets w
        JOIN app.users u ON w.user_id = u.user_id
        ORDER BY w.wallet_id;
    """)
    wallets = cur.fetchall()
    
    for wallet in wallets:
        print(f"\nWallet ID: {wallet['wallet_id']}")
        print(f"  User: {wallet['email']} (ID: {wallet['user_id']})")
        print(f"  Balance: {wallet['balance']}")
        print(f"  Created: {wallet['created_at']}")
    
    print("\n\n=== WALLET TRANSACTIONS ===")
    cur.execute("""
        SELECT wt.*, w.user_id, u.email
        FROM app.wallet_transactions wt
        JOIN app.wallets w ON wt.wallet_id = w.wallet_id
        JOIN app.users u ON w.user_id = u.user_id
        ORDER BY wt.created_at DESC
        LIMIT 20;
    """)
    transactions = cur.fetchall()
    
    for tx in transactions:
        print(f"\nTransaction ID: {tx['transaction_id']}")
        print(f"  User: {tx['email']}")
        print(f"  Amount: {tx['amount']} ({tx['type']})")
        print(f"  Description: {tx['description']}")
        print(f"  Created: {tx['created_at']}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_transactions()
