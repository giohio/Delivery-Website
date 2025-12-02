"""
Migration: Create coupons table and user_coupons table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def run_migration():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Create coupons table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.coupons (
                coupon_id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                discount_value NUMERIC(10, 2) NOT NULL,
                min_order_value NUMERIC(10, 2) DEFAULT 0,
                max_discount NUMERIC(10, 2),
                valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valid_to TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                usage_limit INTEGER,
                used_count INTEGER DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create user_coupons table (track which users used which coupons)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.user_coupons (
                user_coupon_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
                coupon_id INTEGER NOT NULL REFERENCES app.coupons(coupon_id) ON DELETE CASCADE,
                order_id INTEGER REFERENCES app.orders(order_id) ON DELETE SET NULL,
                discount_amount NUMERIC(10, 2) NOT NULL,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, coupon_id, order_id)
            );
        """)
        
        # Create indexes
        cur.execute("CREATE INDEX IF NOT EXISTS idx_coupons_code ON app.coupons(code);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_coupons_active ON app.coupons(is_active, valid_to);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON app.user_coupons(user_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon ON app.user_coupons(coupon_id);")
        
        conn.commit()
        print("✅ Coupons tables created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
