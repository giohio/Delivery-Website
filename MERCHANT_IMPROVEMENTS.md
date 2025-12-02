# 🏪 MERCHANT SYSTEM - CẢI TIẾN VÀ BỔ SUNG

## ✅ ĐÃ CÓ (Hoạt động tốt)
1. ✅ Create Order cho customer
2. ✅ View My Orders
3. ✅ Accept Available Orders (marketplace model)
4. ✅ Track Deliveries
5. ✅ View Payments
6. ✅ Dashboard với stats

---

## 🔧 CẦN SỬA NGAY

### 1. **Thêm Order Items Table** ⭐⭐⭐
**Vấn đề**: Hiện tại order chỉ lưu địa chỉ, không có thông tin sản phẩm

**Schema cần thêm:**
```sql
CREATE TABLE app.order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES app.orders(order_id),
    product_name VARCHAR(255),
    quantity INTEGER,
    unit_price NUMERIC(12,2),
    total_price NUMERIC(12,2),
    notes TEXT
);
```

**Frontend cần thêm:**
- Merchant tạo order: Thêm danh sách items
- View order detail: Hiển thị items trong order

---

### 2. **Product Management** ⭐⭐⭐
**Thêm trang mới**: `MerchantProducts.tsx`

**Chức năng:**
- CRUD products (tên, giá, mô tả, ảnh)
- Category management
- Inventory tracking (optional)

**Schema:**
```sql
CREATE TABLE app.merchant_products (
    product_id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES app.users(user_id),
    name VARCHAR(255),
    description TEXT,
    price NUMERIC(12,2),
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3. **Merchant Profile/Settings** ⭐⭐
**Thêm trang**: `MerchantProfile.tsx`

**Chức năng:**
- Shop name, logo, banner
- Business hours
- Pickup address (default)
- Contact info
- Bank account for payments

**Schema:**
```sql
CREATE TABLE app.merchant_profiles (
    merchant_id INTEGER PRIMARY KEY REFERENCES app.users(user_id),
    shop_name VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    business_hours JSONB,
    default_pickup_address TEXT,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0
);
```

---

### 4. **Coupon System** ⭐⭐
**Merchant tạo coupon cho customer**

**Schema:**
```sql
CREATE TABLE app.coupons (
    coupon_id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES app.users(user_id),
    code VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    discount_type VARCHAR(20), -- 'percentage' or 'fixed'
    discount_value NUMERIC(10,2),
    min_order_value NUMERIC(12,2),
    max_discount NUMERIC(12,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE app.coupon_usage (
    usage_id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES app.coupons(coupon_id),
    customer_id INTEGER REFERENCES app.users(user_id),
    order_id INTEGER REFERENCES app.orders(order_id),
    discount_amount NUMERIC(12,2),
    used_at TIMESTAMP DEFAULT NOW()
);
```

**Frontend:**
- `MerchantCoupons.tsx`: CRUD coupons
- Update `MerchantCreateOrder.tsx`: Apply coupon to order

---

### 5. **Order Statistics & Reports** ⭐⭐
**Cải thiện Dashboard:**
- Chart: Orders per day/week/month
- Revenue breakdown
- Top products (nếu có product management)
- Customer analytics
- Peak hours analysis

---

### 6. **Customer Management** ⭐
**Trang mới**: `MerchantCustomers.tsx`

**Chức năng:**
- Danh sách customers đã order
- Order history per customer
- Customer insights
- Send notifications to customers

---

### 7. **Bulk Order Creation** ⭐
**Tính năng**: Upload CSV/Excel để tạo nhiều orders cùng lúc

**Use case**: Merchant có 100+ orders/day

---

### 8. **Order Templates** ⭐
**Tính năng**: Save địa chỉ pickup/delivery thường dùng

**Use case**: Merchant ship đến cùng 1 địa chỉ nhiều lần (warehouse, hub...)

---

## 🎯 ƯU TIÊN THỰC HIỆN

### Phase 1 (Quan trọng nhất):
1. ✅ Order Items Table
2. ✅ Product Management
3. ✅ Merchant Profile

### Phase 2:
4. ✅ Coupon System
5. ✅ Enhanced Analytics

### Phase 3:
6. Customer Management
7. Bulk Operations
8. Templates

---

## 🔄 CẬP NHẬT MENU MERCHANT

**Menu mới:**
```typescript
const menuItems = [
  { path: '/merchant/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/merchant/orders', icon: <ShoppingBag />, label: 'My Orders' },
  { path: '/merchant/available-orders', icon: <Package />, label: 'Marketplace Orders' },
  { path: '/merchant/create-order', icon: <PlusCircle />, label: 'Create Order' },
  { path: '/merchant/products', icon: <Box />, label: 'Products' },       // NEW
  { path: '/merchant/customers', icon: <Users />, label: 'Customers' },   // NEW
  { path: '/merchant/coupons', icon: <Tag />, label: 'Coupons' },         // NEW
  { path: '/merchant/deliveries', icon: <Truck />, label: 'Deliveries' },
  { path: '/merchant/payments', icon: <DollarSign />, label: 'Payments' },
  { path: '/merchant/analytics', icon: <BarChart3 />, label: 'Analytics' }, // NEW
  { path: '/merchant/profile', icon: <Settings />, label: 'Settings' },   // NEW
];
```

---

## 💡 TÍNH NĂNG NÂNG CAO (Tương lai)

1. **Multi-location**: Merchant có nhiều chi nhánh
2. **Staff Management**: Merchant thêm nhân viên quản lý orders
3. **Integration**: API connect với Shopee/Lazada/TikTok Shop
4. **Loyalty Program**: Điểm thưởng cho customer thân thiết
5. **Auto-dispatch**: Tự động assign shipper gần nhất
6. **Schedule Delivery**: Đặt lịch giao hàng trước
7. **Return/Refund**: Quản lý hoàn trả
8. **Reviews**: Customer review merchant service

---

## 📝 NOTES

- Cần confirm business model rõ ràng: Pure marketplace hay hybrid?
- `MerchantAvailableOrders` nên đổi tên thành `MerchantMarketplaceOrders` cho rõ nghĩa
- Cần role permission kiểm soát merchant không access được customer data
