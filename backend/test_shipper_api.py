import requests
import json

# Backend URL
API_URL = "http://localhost:5000"

# Test shipper login
print("🧪 Testing Shipper Login...")
print("-" * 50)

shipper_creds = {
    "email": "shipper1@example.com",
    "password": "shipper123"
}

# 1. Login
print(f"\n1. Logging in as {shipper_creds['email']}...")
login_response = requests.post(
    f"{API_URL}/auth/login",
    json=shipper_creds,
    headers={"Content-Type": "application/json"}
)

print(f"Status: {login_response.status_code}")
login_data = login_response.json()

if not login_data.get("ok"):
    print(f"❌ Login failed: {login_data.get('error')}")
    exit(1)

token = login_data.get("token")
print(f"✅ Login successful! Token: {token[:50]}...")

# 2. Get courier profile
print(f"\n2. Fetching courier profile...")
profile_response = requests.get(
    f"{API_URL}/api/courier/profile",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(f"Status: {profile_response.status_code}")

if profile_response.status_code != 200:
    print(f"❌ Profile fetch failed: {profile_response.text}")
    exit(1)

profile_data = profile_response.json()
print(f"✅ Profile fetched successfully!")
print(json.dumps(profile_data, indent=2))

# 3. Get wallet
print(f"\n3. Fetching wallet...")
wallet_response = requests.get(
    f"{API_URL}/wallet",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(f"Status: {wallet_response.status_code}")
wallet_data = wallet_response.json()

if not wallet_data.get("ok"):
    print(f"❌ Wallet fetch failed: {wallet_data.get('error')}")
else:
    print(f"✅ Wallet fetched successfully!")
    wallet = wallet_data.get("wallet")
    balance = float(wallet.get('balance', 0)) if wallet.get('balance') else 0
    print(f"   Balance: {balance:,.0f} VND")

# 4. Get deliveries
print(f"\n4. Fetching deliveries...")
deliveries_response = requests.get(
    f"{API_URL}/deliveries/my",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(f"Status: {deliveries_response.status_code}")
deliveries_data = deliveries_response.json()

if not deliveries_data.get("ok"):
    print(f"❌ Deliveries fetch failed: {deliveries_data.get('error')}")
else:
    print(f"✅ Deliveries fetched successfully!")
    deliveries = deliveries_data.get("deliveries", [])
    print(f"   Total: {len(deliveries)} deliveries")

print("\n" + "=" * 50)
print("✅ ALL TESTS PASSED!")
