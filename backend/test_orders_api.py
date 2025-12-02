import requests
import json

# Backend URL
API_URL = "http://localhost:5000"

# Test shipper login and orders API
print("🧪 Testing Shipper Orders API...")
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
user = login_data.get("user")
print(f"✅ Login successful!")
print(f"   User ID: {user.get('user_id')}")
print(f"   Role: {user.get('role_name')}")
print(f"   Token: {token[:50]}...")

# 2. Get deliveries
print(f"\n2. Fetching deliveries...")
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
    exit(1)

deliveries = deliveries_data.get("deliveries", [])
print(f"✅ Deliveries fetched successfully!")
print(f"   Total: {len(deliveries)} deliveries")
if deliveries:
    print(f"   First delivery ID: {deliveries[0].get('delivery_id')}")
    print(f"   Status: {deliveries[0].get('status')}")

# 3. Get orders (NEW ENDPOINT TEST)
print(f"\n3. Fetching orders via /orders endpoint...")
orders_response = requests.get(
    f"{API_URL}/orders",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(f"Status: {orders_response.status_code}")
print(f"Response headers: {dict(orders_response.headers)}")

if orders_response.status_code != 200:
    print(f"❌ Orders fetch failed!")
    print(f"Response text: {orders_response.text}")
    exit(1)

orders_data = orders_response.json()
print(f"✅ Orders response received!")

if not orders_data.get("ok"):
    print(f"❌ Orders API returned error: {orders_data.get('error')}")
    exit(1)

orders = orders_data.get("orders", [])
print(f"✅ Orders fetched successfully!")
print(f"   Total: {len(orders)} orders")

if orders:
    print(f"\n📦 Sample Order:")
    order = orders[0]
    print(f"   Order ID: {order.get('order_id')}")
    print(f"   Delivery ID: {order.get('delivery_id')}")
    print(f"   Status: {order.get('status')}")
    print(f"   Pickup: {order.get('pickup_address')}")
    print(f"   Delivery: {order.get('delivery_address')}")
    print(f"   Coordinates: ({order.get('pickup_lat')}, {order.get('pickup_lng')}) -> ({order.get('delivery_lat')}, {order.get('delivery_lng')})")

print("\n" + "=" * 50)
print("✅ ALL TESTS PASSED!")
