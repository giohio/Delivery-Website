"""
Migration: Add package dimensions and weight fields
Created: 2025-11-27
Description: Add detailed package specifications (weight, dimensions) to orders table
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import get_db_connection

def run_migration():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("🔄 Starting migration: Add package dimensions...")
        
        # Add weight and dimension fields to orders table
        cur.execute("""
            ALTER TABLE app.orders
            ADD COLUMN IF NOT EXISTS package_weight DECIMAL(8,2),
            ADD COLUMN IF NOT EXISTS package_length DECIMAL(8,2),
            ADD COLUMN IF NOT EXISTS package_width DECIMAL(8,2),
            ADD COLUMN IF NOT EXISTS package_height DECIMAL(8,2);
        """)
        
        print("✅ Added package dimension columns to orders table")
        
        # Add comment for documentation
        cur.execute("""
            COMMENT ON COLUMN app.orders.package_weight IS 'Package weight in kilograms (kg)';
            COMMENT ON COLUMN app.orders.package_length IS 'Package length in centimeters (cm)';
            COMMENT ON COLUMN app.orders.package_width IS 'Package width in centimeters (cm)';
            COMMENT ON COLUMN app.orders.package_height IS 'Package height in centimeters (cm)';
        """)
        
        print("✅ Added column comments")
        
        # Update package_size comment with new specs
        cur.execute("""
            COMMENT ON COLUMN app.orders.package_size IS 'Package size category: small (≤5kg, 30x30x30cm), medium (5-15kg, 50x50x50cm), large (15-30kg, 80x80x80cm)';
        """)
        
        print("✅ Updated package_size column comment")
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("\n📦 Package specifications:")
        print("   - Small:  ≤5kg,  30x30x30cm, +0 VND")
        print("   - Medium: 5-15kg, 50x50x50cm, +5,000 VND")
        print("   - Large:  15-30kg, 80x80x80cm, +10,000 VND")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
