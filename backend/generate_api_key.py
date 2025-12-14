"""
Script tạo API Key đơn giản (không cần database)
Tạo credentials và SQL để import vào database sau
"""

import secrets
import hashlib
from datetime import datetime, timedelta

def generate_api_key():
    """Generate a unique API key"""
    return 'sk_' + secrets.token_urlsafe(32)

def generate_api_secret():
    """Generate a unique API secret"""
    return 'ss_' + secrets.token_urlsafe(48)

def hash_secret(secret):
    """Hash the API secret for storage"""
    return hashlib.sha256(secret.encode()).hexdigest()

def create_api_credentials(key_name, user_id=1, permissions=None, rate_limit=1000, expires_in_days=365):
    """Create API credentials"""
    if permissions is None:
        permissions = ["orders:read", "orders:write"]
    
    # Generate credentials
    api_key = generate_api_key()
    api_secret = generate_api_secret()
    secret_hash = hash_secret(api_secret)
    
    # Calculate expiration
    expires_at = datetime.now() + timedelta(days=expires_in_days) if expires_in_days else None
    created_at = datetime.now()
    
    # Format permissions for PostgreSQL array
    permissions_sql = "{" + ",".join([f'"{p}"' for p in permissions]) + "}"
    
    # Generate SQL
    sql = f"""
-- Tạo API Key: {key_name}
INSERT INTO app.api_keys 
(user_id, key_name, api_key, secret_hash, permissions, rate_limit, expires_at, created_at)
VALUES (
    {user_id},
    '{key_name}',
    '{api_key}',
    '{secret_hash}',
    ARRAY{permissions_sql}::text[],
    {rate_limit},
    {"'" + expires_at.strftime('%Y-%m-%d %H:%M:%S') + "'" if expires_at else 'NULL'},
    '{created_at.strftime('%Y-%m-%d %H:%M:%S')}'
);
"""
    
    # Create detailed info
    info = f"""
{'='*80}
✅ API KEY ĐÃ ĐƯỢC TẠO!
{'='*80}

📋 THÔNG TIN API KEY:
   Key Name: {key_name}
   User ID: {user_id}
   Permissions: {', '.join(permissions)}
   Rate Limit: {rate_limit} requests/day
   Expires At: {expires_at.strftime('%Y-%m-%d') if expires_at else 'Never'}
   Created At: {created_at.strftime('%Y-%m-%d %H:%M:%S')}

🔑 CREDENTIALS (Lưu lại ngay!):
   API Key: {api_key}
   API Secret: {api_secret}

⚠️  LƯU Ý:
   - Lưu API Secret ngay! Không thể xem lại sau này
   - Cả API Key và API Secret đều cần thiết để xác thực
   - Secret Hash: {secret_hash[:20]}...

{'='*80}

📝 SQL ĐỂ IMPORT VÀO DATABASE:
{sql}

{'='*80}

🧪 TEST API KEY:
curl -X GET http://localhost:5000/api/external/orders \\
  -H "X-API-Key: {api_key}" \\
  -H "X-API-Secret: {api_secret}"

{'='*80}
"""
    
    return {
        'api_key': api_key,
        'api_secret': api_secret,
        'secret_hash': secret_hash,
        'sql': sql,
        'info': info,
        'key_name': key_name
    }

if __name__ == "__main__":
    import sys
    
    print("\n🔧 CÔNG CỤ TẠO API KEY (Standalone)\n")
    
    # Configuration
    configs = [
        {
            'key_name': 'Mobile App - Production',
            'user_id': 1,
            'permissions': ['orders:read', 'orders:write'],
            'rate_limit': 5000,
            'expires_in_days': 365
        },
        {
            'key_name': 'Web Dashboard - Test',
            'user_id': 1,
            'permissions': ['orders:read'],
            'rate_limit': 1000,
            'expires_in_days': 90
        },
        {
            'key_name': 'Partner Integration',
            'user_id': 1,
            'permissions': ['orders:read', 'orders:write'],
            'rate_limit': 10000,
            'expires_in_days': 730
        }
    ]
    
    print("Chọn loại API key muốn tạo:")
    print("1. Mobile App - Production (5000 req/day, 365 days, full access)")
    print("2. Web Dashboard - Test (1000 req/day, 90 days, read only)")
    print("3. Partner Integration (10000 req/day, 730 days, full access)")
    print("4. Custom")
    
    choice = input("\nChọn (1-4) [default: 1]: ").strip()
    
    if choice == '4':
        key_name = input("Key name: ").strip() or "Custom API Key"
        user_id = int(input("User ID [default: 1]: ").strip() or "1")
        
        print("\nPermissions:")
        print("1. orders:read only")
        print("2. orders:write only")
        print("3. Both (full access)")
        perm = input("Choose (1-3) [default: 3]: ").strip()
        
        if perm == '1':
            permissions = ['orders:read']
        elif perm == '2':
            permissions = ['orders:write']
        else:
            permissions = ['orders:read', 'orders:write']
        
        rate_limit = int(input("Rate limit (req/day) [default: 1000]: ").strip() or "1000")
        expires_in_days = int(input("Expires in days [default: 365]: ").strip() or "365")
        
        config = {
            'key_name': key_name,
            'user_id': user_id,
            'permissions': permissions,
            'rate_limit': rate_limit,
            'expires_in_days': expires_in_days
        }
    else:
        idx = int(choice) - 1 if choice in ['1', '2', '3'] else 0
        config = configs[idx]
    
    # Generate credentials
    result = create_api_credentials(**config)
    
    # Print to console
    print(result['info'])
    
    # Save to file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"api_key_{config['key_name'].replace(' ', '_')}_{timestamp}.txt"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(result['info'])
    
    # Save SQL to file
    sql_filename = f"api_key_{config['key_name'].replace(' ', '_')}_{timestamp}.sql"
    with open(sql_filename, 'w', encoding='utf-8') as f:
        f.write(result['sql'])
    
    print(f"\n💾 Đã lưu thông tin vào:")
    print(f"   - {filename}")
    print(f"   - {sql_filename}")
    print("\n✅ Hoàn tất!\n")
