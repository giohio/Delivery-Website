"""
Migration script to add payment_method column to orders table
Run this script once to update existing database
"""
from db import get_db_connection

def migrate():
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
            print("✓ Column 'payment_method' already exists in app.orders")
        else:
            # Add the column
            cur.execute("""
                ALTER TABLE app.orders 
                ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';
            """)
            conn.commit()
            print("✓ Successfully added 'payment_method' column to app.orders")
        
        cur.close()
        conn.close()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate()
