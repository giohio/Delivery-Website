"""
Script to fix order status sync issues
This will update all orders to match their delivery status
"""
from db import get_db_connection

def fix_order_status():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("🔍 Checking for orders with mismatched status...")
        
        # Find orders that have a delivery_id but status doesn't match delivery status
        cur.execute("""
            SELECT 
                o.order_id,
                o.status as order_status,
                d.status as delivery_status,
                d.delivery_id
            FROM app.orders o
            JOIN app.deliveries d ON o.delivery_id = d.delivery_id
            WHERE o.status != d.status;
        """)
        
        mismatched = cur.fetchall()
        
        if not mismatched:
            print("✓ All orders are in sync with their deliveries!")
            return
        
        print(f"⚠️  Found {len(mismatched)} orders with mismatched status:")
        for row in mismatched:
            order_id, order_status, delivery_status, delivery_id = row
            print(f"  - Order #{order_id}: {order_status} → {delivery_status} (Delivery #{delivery_id})")
        
        # Fix the mismatched orders
        print("\n🔧 Fixing mismatched orders...")
        cur.execute("""
            UPDATE app.orders o
            SET status = d.status
            FROM app.deliveries d
            WHERE o.delivery_id = d.delivery_id
            AND o.status != d.status
            RETURNING o.order_id, o.status;
        """)
        
        fixed = cur.fetchall()
        conn.commit()
        
        print(f"✓ Fixed {len(fixed)} orders:")
        for row in fixed:
            order_id, new_status = row
            print(f"  - Order #{order_id} → {new_status}")
        
        print("\n✅ Order status sync completed successfully!")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix_order_status()
