from db import get_db_connection
from datetime import datetime

conn = get_db_connection()
cur = conn.cursor()

print("\n" + "="*70)
print("DETAILED COUPON ANALYSIS")
print("="*70)

# Get all coupons with detailed info
cur.execute("""
    SELECT 
        code, 
        discount_type, 
        discount_value, 
        min_order_value,
        max_discount,
        valid_from,
        valid_to,
        is_active,
        usage_limit,
        used_count,
        description
    FROM app.coupons
    ORDER BY code;
""")

coupons = cur.fetchall()

for c in coupons:
    code, dtype, value, min_order, max_disc, valid_from, valid_to, active, limit, used, desc = c
    
    print(f"\n📋 {code}")
    print(f"   Description: {desc}")
    print(f"   Type: {dtype}")
    print(f"   Value: {value}{'%' if dtype == 'percentage' else '₫'}")
    print(f"   Min Order: {min_order:,.0f}₫")
    print(f"   Max Discount: {max_disc:,.0f}₫" if max_disc else "   Max Discount: None")
    print(f"   Valid: {valid_from.strftime('%Y-%m-%d')} → {valid_to.strftime('%Y-%m-%d')}")
    print(f"   Status: {'✓ ACTIVE' if active else '✗ INACTIVE'}")
    print(f"   Usage: {used}/{limit if limit else '∞'}")
    
    # Check if expired
    now = datetime.now()
    if now > valid_to:
        print(f"   ⚠️  EXPIRED on {valid_to.strftime('%Y-%m-%d')}")
    elif now < valid_from:
        print(f"   ⏳ Not yet valid (starts {valid_from.strftime('%Y-%m-%d')})")
    else:
        days_left = (valid_to - now).days
        print(f"   ✓ Valid for {days_left} more days")
    
    # Test with sample order amounts
    test_amounts = [50000, 100000, 200000, 500000]
    print(f"   Test calculations:")
    
    for amount in test_amounts:
        # Check if meets minimum
        if amount < min_order:
            print(f"      {amount:>7,}₫ → ✗ Below minimum ({min_order:,.0f}₫)")
            continue
        
        # Calculate discount
        if dtype == 'percentage':
            discount = (amount * value) / 100
            if max_disc:
                discount = min(discount, float(max_disc))
        else:
            discount = float(value)
        
        final = amount - discount
        print(f"      {amount:>7,}₫ → -{discount:>6,.0f}₫ = {final:>7,.0f}₫")

cur.close()
conn.close()

print("\n" + "="*70)
