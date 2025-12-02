from db import get_db_connection
from datetime import datetime, timedelta

def seed_coupons():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Sample coupons
        coupons = [
            {
                "code": "WELCOME10",
                "discount_type": "percentage",
                "discount_value": 10,
                "min_order_value": 50000,
                "max_discount": 20000,
                "valid_to": datetime.now() + timedelta(days=30),
                "usage_limit": 100,
                "description": "10% off for new customers (max 20,000₫)"
            },
            {
                "code": "FREESHIP",
                "discount_type": "fixed",
                "discount_value": 15000,
                "min_order_value": 100000,
                "max_discount": None,
                "valid_to": datetime.now() + timedelta(days=60),
                "usage_limit": 200,
                "description": "Free shipping - 15,000₫ off"
            },
            {
                "code": "VIP20",
                "discount_type": "percentage",
                "discount_value": 20,
                "min_order_value": 200000,
                "max_discount": 50000,
                "valid_to": datetime.now() + timedelta(days=90),
                "usage_limit": 50,
                "description": "VIP 20% discount (max 50,000₫)"
            },
            {
                "code": "FLASH50K",
                "discount_type": "fixed",
                "discount_value": 50000,
                "min_order_value": 300000,
                "max_discount": None,
                "valid_to": datetime.now() + timedelta(days=7),
                "usage_limit": 20,
                "description": "Flash sale - 50,000₫ off orders over 300,000₫"
            },
            {
                "code": "NEWYEAR",
                "discount_type": "percentage",
                "discount_value": 15,
                "min_order_value": 0,
                "max_discount": 30000,
                "valid_to": datetime.now() + timedelta(days=365),
                "usage_limit": 500,
                "description": "New Year special - 15% off all orders"
            },
        ]
        
        for coupon in coupons:
            # Check if exists
            cur.execute("SELECT 1 FROM app.coupons WHERE code = %s", (coupon["code"],))
            if cur.fetchone():
                print(f"⚠️  Coupon {coupon['code']} already exists, skipping...")
                continue
            
            cur.execute("""
                INSERT INTO app.coupons 
                (code, discount_type, discount_value, min_order_value, max_discount, valid_to, usage_limit, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                coupon["code"],
                coupon["discount_type"],
                coupon["discount_value"],
                coupon["min_order_value"],
                coupon["max_discount"],
                coupon["valid_to"],
                coupon["usage_limit"],
                coupon["description"]
            ))
            print(f"✅ Created coupon: {coupon['code']} - {coupon['description']}")
        
        conn.commit()
        print(f"\n🎉 Successfully seeded {len(coupons)} coupons!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error seeding coupons: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_coupons()
