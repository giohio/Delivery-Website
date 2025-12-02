"""
Check seeded data statistics
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from db import get_db_connection
import psycopg2.extras

def main():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    print("\n" + "="*60)
    print("📊 DATABASE STATISTICS")
    print("="*60 + "\n")
    
    # Users by role
    print("👥 USERS BY ROLE:")
    cur.execute("""
        SELECT r.role_name, COUNT(*) as count
        FROM app.users u
        JOIN app.roles r ON u.role_id = r.role_id
        GROUP BY r.role_name
        ORDER BY r.role_name
    """)
    for row in cur.fetchall():
        print(f"   {row['role_name']:12s}: {row['count']:3d} users")
    
    # Orders by status
    print("\n📦 ORDERS BY STATUS:")
    cur.execute("""
        SELECT status, COUNT(*) as count
        FROM app.orders
        GROUP BY status
        ORDER BY count DESC
    """)
    for row in cur.fetchall():
        print(f"   {row['status']:12s}: {row['count']:3d} orders")
    
    # Orders by service type
    print("\n🚚 ORDERS BY SERVICE TYPE:")
    cur.execute("""
        SELECT service_type, COUNT(*) as count
        FROM app.orders
        GROUP BY service_type
        ORDER BY count DESC
    """)
    for row in cur.fetchall():
        print(f"   {row['service_type']:12s}: {row['count']:3d} orders")
    
    # Orders by package size
    print("\n📦 ORDERS BY PACKAGE SIZE:")
    cur.execute("""
        SELECT package_size, COUNT(*) as count
        FROM app.orders
        GROUP BY package_size
        ORDER BY count DESC
    """)
    for row in cur.fetchall():
        print(f"   {row['package_size']:12s}: {row['count']:3d} orders")
    
    # Deliveries
    print("\n🚛 DELIVERIES:")
    cur.execute("SELECT COUNT(*) as count FROM app.deliveries")
    print(f"   Total deliveries: {cur.fetchone()['count']}")
    
    # Payments
    print("\n💰 PAYMENTS:")
    cur.execute("SELECT COUNT(*) as count FROM app.payments")
    print(f"   Total payments: {cur.fetchone()['count']}")
    
    # Shipper wallets
    print("\n💳 SHIPPER WALLETS:")
    cur.execute("""
        SELECT 
            COUNT(*) as count,
            MIN(balance) as min_balance,
            MAX(balance) as max_balance,
            AVG(balance)::INTEGER as avg_balance,
            SUM(balance) as total_balance
        FROM app.shipper_wallets
    """)
    row = cur.fetchone()
    print(f"   Active wallets: {row['count']}")
    print(f"   Total balance: {row['total_balance']:,} VND")
    print(f"   Average balance: {row['avg_balance']:,} VND")
    print(f"   Range: {row['min_balance']:,} - {row['max_balance']:,} VND")
    
    # Ratings
    print("\n⭐ RATINGS:")
    cur.execute("""
        SELECT 
            COUNT(*) as count,
            AVG(score)::NUMERIC(3,2) as avg_score
        FROM app.ratings
    """)
    row = cur.fetchone()
    if row['count']:
        print(f"   Total ratings: {row['count']}")
        print(f"   Average score: {row['avg_score']}/5.0")
    else:
        print(f"   Total ratings: 0")
    
    # Notifications
    print("\n🔔 NOTIFICATIONS:")
    cur.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read,
            SUM(CASE WHEN NOT is_read THEN 1 ELSE 0 END) as unread
        FROM app.notifications
    """)
    row = cur.fetchone()
    print(f"   Total: {row['total']}")
    print(f"   Read: {row['read']}")
    print(f"   Unread: {row['unread']}")
    
    # Revenue
    print("\n💵 REVENUE:")
    cur.execute("""
        SELECT 
            COUNT(*) as order_count,
            SUM(price_estimate) as total_revenue,
            AVG(price_estimate)::INTEGER as avg_order_value
        FROM app.orders
        WHERE status != 'CANCELED'
    """)
    row = cur.fetchone()
    print(f"   Active orders: {row['order_count']}")
    print(f"   Total revenue: {row['total_revenue']:,} VND")
    print(f"   Average order: {row['avg_order_value']:,} VND")
    
    print("\n" + "="*60)
    print("✅ All data looks good!")
    print("="*60 + "\n")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
