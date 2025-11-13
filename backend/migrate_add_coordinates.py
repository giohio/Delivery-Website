import psycopg2
from db import get_db_connection

def add_coordinates_to_orders():
    """Add coordinate columns to orders table"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("Adding coordinate columns to orders table...")
        
        # Add pickup coordinates
        cur.execute("""
            ALTER TABLE app.orders 
            ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION;
        """)
        
        conn.commit()
        print("✅ Successfully added coordinate columns to orders table")
        
        # Verify columns were added
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'app' 
            AND table_name = 'orders'
            AND column_name IN ('pickup_lat', 'pickup_lng', 'delivery_lat', 'delivery_lng');
        """)
        
        columns = cur.fetchall()
        print("\nAdded columns:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_coordinates_to_orders()
    print("\n✅ Migration completed successfully!")
