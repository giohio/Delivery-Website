import requests
import json

# Test coupon validation
API_BASE = "http://127.0.0.1:5000"

# Login first to get token
login_response = requests.post(
    f"{API_BASE}/auth/login",
    json={"email": "customer1@example.com", "password": "password123"}
)

if login_response.status_code == 200:
    token = login_response.json().get('token')
    print(f"✓ Login successful, token: {token[:50]}...")
    
    # Test NEWYEAR coupon with different amounts
    test_cases = [
        {"code": "NEWYEAR", "amount": 50000, "expected": "valid"},
        {"code": "NEWYEAR", "amount": 100000, "expected": "valid"},
        {"code": "NEWYEAR", "amount": 200000, "expected": "valid with max discount"},
        {"code": "WELCOME10", "amount": 30000, "expected": "below minimum"},
        {"code": "WELCOME10", "amount": 100000, "expected": "valid"},
        {"code": "INVALID", "amount": 100000, "expected": "invalid code"},
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n" + "="*70)
    print("COUPON VALIDATION TESTS")
    print("="*70)
    
    for test in test_cases:
        response = requests.post(
            f"{API_BASE}/api/coupons/validate",
            headers=headers,
            json={"code": test["code"], "order_amount": test["amount"]}
        )
        
        result = response.json()
        print(f"\n📋 Test: {test['code']} with {test['amount']:,.0f}₫")
        print(f"   Expected: {test['expected']}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(result, indent=2)}")
        
        if result.get('valid'):
            discount = result.get('discount', 0)
            final = result.get('final_amount', 0)
            print(f"   ✓ Discount: {discount:,.0f}₫, Final: {final:,.0f}₫")
        else:
            print(f"   ✗ Error: {result.get('message', 'Unknown error')}")
    
else:
    print(f"✗ Login failed: {login_response.text}")
