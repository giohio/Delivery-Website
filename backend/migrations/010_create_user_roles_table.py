"""
Migration: Create user_roles table for multi-role support
Allows users to have multiple roles (customer, merchant, shipper)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def up():
    """Apply migration"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Create user_roles table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.user_roles (
                user_role_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
                role_id INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                approved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, role_id)
            );
        """)
        
        # Create index for faster queries
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
            ON app.user_roles(user_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_roles_active 
            ON app.user_roles(user_id, is_active);
        """)
        
        # Add current_role_id to users table for active role
        cur.execute("""
            ALTER TABLE app.users 
            ADD COLUMN IF NOT EXISTS current_role_id INTEGER DEFAULT 4;
        """)
        
        # Give all existing users customer role by default
        cur.execute("""
            INSERT INTO app.user_roles (user_id, role_id, is_active, approved_at)
            SELECT user_id, 4, TRUE, NOW()
            FROM app.users
            ON CONFLICT (user_id, role_id) DO NOTHING;
        """)
        
        # Create merchant_profiles table for shop info
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.merchant_profiles (
                merchant_profile_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
                shop_name VARCHAR(255) NOT NULL,
                shop_address TEXT,
                shop_phone VARCHAR(20),
                business_license VARCHAR(100),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            );
        """)
        
        # Create shipper_profiles table for shipper info
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.shipper_profiles (
                shipper_profile_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
                vehicle_type VARCHAR(50),
                license_plate VARCHAR(20),
                id_card_number VARCHAR(20),
                is_verified BOOLEAN DEFAULT FALSE,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            );
        """)
        
        conn.commit()
        print("✅ Migration 010: Created user_roles, merchant_profiles, shipper_profiles tables")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration 010 failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def down():
    """Rollback migration"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DROP TABLE IF EXISTS app.shipper_profiles CASCADE;")
        cur.execute("DROP TABLE IF EXISTS app.merchant_profiles CASCADE;")
        cur.execute("DROP TABLE IF EXISTS app.user_roles CASCADE;")
        cur.execute("ALTER TABLE app.users DROP COLUMN IF EXISTS current_role_id;")
        
        conn.commit()
        print("✅ Migration 010 rolled back")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Rollback 010 failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    up()
