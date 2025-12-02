import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def run_migration():
    """Add payment_method column to orders table"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Check if column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'app' 
            AND table_name = 'orders' 
            AND column_name = 'payment_method';
        """)
        
        if cur.fetchone():
            print("✓ Column payment_method already exists in orders table")
            return
        
        # Add payment_method column
        print("Adding payment_method column to orders table...")
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash';
        """)
        
        # Update existing orders to have 'cash' as payment method
        cur.execute("""
            UPDATE app.orders 
            SET payment_method = 'cash' 
            WHERE payment_method IS NULL;
        """)
        
        conn.commit()
        print("✓ Migration completed successfully")
        print("  - Added payment_method column to orders table")
        print("  - Set default value to 'cash' for existing orders")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
