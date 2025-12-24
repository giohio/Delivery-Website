"""
Migration: Add service types and enhanced order fields
Date: 2025-11-27
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db import get_db_connection

def upgrade():
    """Add new columns to orders table"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Add service_type column
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'bike';
        """)
        
        # Add package_size column
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS package_size VARCHAR(20) DEFAULT 'small';
        """)
        
        # Add contact info for pickup
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS pickup_contact_name VARCHAR(255);
        """)
        
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS pickup_contact_phone VARCHAR(20);
        """)
        
        # Add contact info for delivery
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS delivery_contact_name VARCHAR(255);
        """)
        
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS delivery_contact_phone VARCHAR(20);
        """)
        
        # Add notes
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS notes TEXT;
        """)
        
        conn.commit()
        print("✅ Migration completed: service types added")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def downgrade():
    """Remove added columns (rollback)"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            ALTER TABLE app.orders 
            DROP COLUMN IF EXISTS service_type,
            DROP COLUMN IF EXISTS package_size,
            DROP COLUMN IF EXISTS pickup_contact_name,
            DROP COLUMN IF EXISTS pickup_contact_phone,
            DROP COLUMN IF EXISTS delivery_contact_name,
            DROP COLUMN IF EXISTS delivery_contact_phone,
            DROP COLUMN IF EXISTS notes;
        """)
        
        conn.commit()
        print("✅ Rollback completed")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Rollback failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'down':
        downgrade()
    else:
        upgrade()
