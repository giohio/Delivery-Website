"""
Additional seed data for richer UI display
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from db import get_db_connection
import psycopg2.extras
from datetime import datetime, timedelta
import random

def add_wallet_transactions():
    """Add wallet balance for shippers"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get all shippers
        cur.execute("SELECT user_id FROM app.users u JOIN app.roles r ON u.role_id = r.role_id WHERE r.role_name = 'shipper'")
        shippers = [row[0] for row in cur.fetchall()]
        
        count = 0
        for shipper_id in shippers:
            # Update wallet with random balance
            balance = random.randint(500000, 5000000)
            
            cur.execute("""
                UPDATE app.shipper_wallets 
                SET balance = %s, updated_at = NOW()
                WHERE shipper_id = %s
            """, (balance, shipper_id))
            
            count += 1
        
        conn.commit()
        print(f"✅ Updated {count} shipper wallet balances")
        
    finally:
        cur.close()
        conn.close()

def add_coupons():
    """Add coupon codes"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        coupons = [
            {"code": "WELCOME10", "discount_type": "percentage", "discount_value": 10, "min_order_value": 50000, "max_uses": 100},
            {"code": "FREESHIP", "discount_type": "fixed", "discount_value": 15000, "min_order_value": 100000, "max_uses": 50},
            {"code": "VIP20", "discount_type": "percentage", "discount_value": 20, "min_order_value": 200000, "max_uses": 20},
            {"code": "NEWYEAR", "discount_type": "percentage", "discount_value": 15, "min_order_value": 0, "max_uses": 200},
            {"code": "FLASH50K", "discount_type": "fixed", "discount_value": 50000, "min_order_value": 300000, "max_uses": 10},
        ]
        
        count = 0
        for coupon in coupons:
            # Check if exists
            cur.execute("SELECT 1 FROM app.coupons WHERE code = %s", (coupon["code"],))
            if not cur.fetchone():
                expires_at = datetime.now() + timedelta(days=30)
                cur.execute("""
                    INSERT INTO app.coupons (code, discount_type, discount_value, min_order_value, max_uses, current_uses, expires_at, is_active)
                    VALUES (%s, %s, %s, %s, %s, 0, %s, TRUE)
                """, (coupon["code"], coupon["discount_type"], coupon["discount_value"], 
                      coupon["min_order_value"], coupon["max_uses"], expires_at))
                count += 1
        
        conn.commit()
        print(f"✅ Added {count} coupons")
        
    finally:
        cur.close()
        conn.close()

def update_order_statuses():
    """Update some orders to have different statuses"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        statuses = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELED']
        
        cur.execute("SELECT order_id FROM app.orders WHERE status = 'PENDING' LIMIT 20")
        orders = [row[0] for row in cur.fetchall()]
        
        count = 0
        for order_id in orders:
            status = random.choice(statuses)
            cur.execute("UPDATE app.orders SET status = %s WHERE order_id = %s", (status, order_id))
            count += 1
        
        conn.commit()
        print(f"✅ Updated {count} order statuses")
        
    finally:
        cur.close()
        conn.close()

def add_more_notifications():
    """Add more diverse notifications"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get all users
        cur.execute("SELECT user_id, role_id FROM app.users")
        users = cur.fetchall()
        
        notification_templates = {
            "customer": [
                ("Order Confirmed", "Your order has been confirmed and is being prepared"),
                ("Shipper Assigned", "A shipper has been assigned to your order"),
                ("Out for Delivery", "Your order is out for delivery"),
                ("Delivery Complete", "Your order has been successfully delivered"),
                ("Promotion Available", "Special discount available for your next order!"),
            ],
            "shipper": [
                ("New Orders Available", "Check out new delivery orders in your area"),
                ("Payment Received", "Your delivery payment has been processed"),
                ("Rating Received", "You received a new rating from a customer"),
                ("Weekly Summary", "Your weekly delivery summary is ready"),
                ("Bonus Earned", "You earned a bonus for excellent service!"),
            ],
            "merchant": [
                ("New Order", "You have received a new order from a customer"),
                ("Order Completed", "An order has been successfully delivered"),
                ("Payment Received", "Payment received for order"),
                ("Monthly Report", "Your monthly performance report is available"),
                ("Inventory Alert", "Some items are running low in stock"),
            ]
        }
        
        count = 0
        for user_id, role_id in users:
            # Get role name
            cur.execute("SELECT role_name FROM app.roles WHERE role_id = %s", (role_id,))
            role = cur.fetchone()[0]
            
            if role in notification_templates:
                templates = notification_templates[role]
                # Add 3-5 random notifications per user
                for _ in range(random.randint(3, 5)):
                    title, body = random.choice(templates)
                    is_read = random.choice([True, False, False])  # 33% read
                    days_ago = random.randint(0, 7)
                    created_at = datetime.now() - timedelta(days=days_ago)
                    
                    cur.execute("""
                        INSERT INTO app.notifications (user_id, title, body, is_read, created_at)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (user_id, f"[SEED] {title}", body, is_read, created_at))
                    count += 1
        
        conn.commit()
        print(f"✅ Added {count} additional notifications")
        
    finally:
        cur.close()
        conn.close()

def main():
    print("\n" + "="*50)
    print("🌱 ADDING ADDITIONAL SEED DATA")
    print("="*50 + "\n")
    
    add_wallet_transactions()
    # add_coupons()  # Skip if table doesn't exist
    update_order_statuses()
    add_more_notifications()
    
    print("\n" + "="*50)
    print("✨ ADDITIONAL SEED DATA COMPLETED!")
    print("="*50)

if __name__ == "__main__":
    main()
