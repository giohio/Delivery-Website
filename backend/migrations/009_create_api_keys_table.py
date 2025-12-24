import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection

def create_api_keys_table():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print("Creating api_keys table...")
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS app.api_keys (
                api_key_id SERIAL PRIMARY KEY,
                key_name VARCHAR(200) NOT NULL,
                api_key VARCHAR(100) UNIQUE NOT NULL,
                api_secret VARCHAR(100) NOT NULL,
                user_id INTEGER REFERENCES app.users(user_id),
                permissions JSONB DEFAULT '[]',
                is_active BOOLEAN DEFAULT true,
                rate_limit INTEGER DEFAULT 1000,
                last_used_at TIMESTAMP,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)
        
        # Create index for faster lookup
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_api_keys_key 
            ON app.api_keys(api_key) WHERE is_active = true;
        """)
        
        # Create index for user_id
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_api_keys_user 
            ON app.api_keys(user_id);
        """)
        
        conn.commit()
        print("✅ API keys table created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    create_api_keys_table()
