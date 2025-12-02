"""
Migration 006: Add avatar column to users table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def run_migration():
    """Add avatar column to app.users table"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Check if avatar column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'app' 
            AND table_name = 'users' 
            AND column_name = 'avatar'
        """)
        
        if cur.fetchone():
            print("✓ Column 'avatar' already exists in app.users")
            return
        
        # Add avatar column
        cur.execute("""
            ALTER TABLE app.users
            ADD COLUMN avatar TEXT
        """)
        
        conn.commit()
        print("✓ Successfully added 'avatar' column to app.users")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Error adding avatar column: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    print("Running migration 006: Add avatar column...")
    run_migration()
    print("Migration 006 completed!")
