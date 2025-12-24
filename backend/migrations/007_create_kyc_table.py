"""
Migration 007: Create KYC submissions table for shipper verification
"""
import sys
sys.path.insert(0, "d:\\Delivery website\\backend")
from db import get_db_connection

def up():
    """Create kyc_submissions table"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Create KYC submissions table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.kyc_submissions (
                id SERIAL PRIMARY KEY,
                shipper_id INTEGER NOT NULL REFERENCES app.users(user_id),
                id_number VARCHAR(20),
                id_front_image TEXT,
                id_back_image TEXT,
                driver_license VARCHAR(20),
                license_image TEXT,
                vehicle_type VARCHAR(20),
                license_plate VARCHAR(20),
                vehicle_image TEXT,
                verification_status VARCHAR(20) DEFAULT 'pending',
                rejection_reason TEXT,
                verified_at TIMESTAMP WITHOUT TIME ZONE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_shipper_kyc UNIQUE (shipper_id)
            );
        """)
        
        # Create index for faster queries
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_kyc_status 
            ON app.kyc_submissions(verification_status);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_kyc_shipper 
            ON app.kyc_submissions(shipper_id);
        """)
        
        conn.commit()
        print("✓ Created kyc_submissions table with indexes")
    except Exception as e:
        conn.rollback()
        print(f"✗ Error creating kyc_submissions table: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def down():
    """Drop kyc_submissions table"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DROP TABLE IF EXISTS app.kyc_submissions CASCADE;")
        conn.commit()
        print("✓ Dropped kyc_submissions table")
    except Exception as e:
        conn.rollback()
        print(f"✗ Error dropping kyc_submissions table: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Running migration 007: Create KYC submissions table")
    up()
    print("Migration complete!")
