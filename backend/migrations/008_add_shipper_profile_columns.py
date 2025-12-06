import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def add_shipper_profile_columns():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("Adding columns to app.shipper_profiles...")
        
        # Check if columns exist, if not add them
        columns_to_add = [
            ("operating_area", "TEXT"),
            ("vehicle_type", "VARCHAR(50) DEFAULT 'motorbike'"),
            ("license_plate", "VARCHAR(20)"),
            ("id_number", "VARCHAR(50)"),
            ("driver_license", "VARCHAR(50)"),
            ("bank_name", "VARCHAR(100)"),
            ("account_number", "VARCHAR(50)"),
            ("account_name", "VARCHAR(200)"),
            ("id_front_image", "TEXT"),
            ("id_back_image", "TEXT"),
            ("license_image", "TEXT"),
            ("vehicle_image", "TEXT"),
            ("verification_status", "VARCHAR(20) DEFAULT 'pending'"),
        ]
        
        for column_name, column_type in columns_to_add:
            try:
                cur.execute(f"""
                    ALTER TABLE app.shipper_profiles 
                    ADD COLUMN IF NOT EXISTS {column_name} {column_type};
                """)
                print(f"  ✓ Added column: {column_name}")
            except Exception as e:
                print(f"  ⚠ Column {column_name}: {e}")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_shipper_profile_columns()
