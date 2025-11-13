"""
Migration: Add KYC fields to shipper_profiles table
Date: 2025-11-13
"""

from db import get_db_connection

def run_migration():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("🔧 Starting migration: Add KYC fields to shipper_profiles...")
        
        # Add new columns for KYC
        cur.execute("""
            ALTER TABLE app.shipper_profiles
            ADD COLUMN IF NOT EXISTS operating_area VARCHAR(255),
            ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50) DEFAULT 'motorbike',
            ADD COLUMN IF NOT EXISTS license_plate VARCHAR(50),
            ADD COLUMN IF NOT EXISTS id_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS driver_license VARCHAR(50),
            ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS account_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS id_front_image TEXT,
            ADD COLUMN IF NOT EXISTS id_back_image TEXT,
            ADD COLUMN IF NOT EXISTS license_image TEXT,
            ADD COLUMN IF NOT EXISTS vehicle_image TEXT;
        """)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify the new columns
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'app' AND table_name = 'shipper_profiles' 
            ORDER BY ordinal_position;
        """)
        
        columns = cur.fetchall()
        print(f"\n📋 Total columns in shipper_profiles: {len(columns)}")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
