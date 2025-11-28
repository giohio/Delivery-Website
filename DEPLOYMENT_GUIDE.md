# Deployment Guide - Payment Method & Shipper Orders Update

## Các thay đổi đã thực hiện:

### 1. Backend Changes
- ✅ Thêm cột `payment_method` vào bảng `orders`
- ✅ Cập nhật endpoint `/orders` để lưu payment_method khi tạo order
- ✅ Cập nhật endpoint `/deliveries/available` để shipper thấy TẤT CẢ orders (không chỉ PENDING)

### 2. Frontend Changes
- ✅ Thêm UI chọn phương thức thanh toán trong `CreateOrderModal`
- ✅ Cập nhật `ShipperDashboardModern` để hiển thị tất cả orders với status badge
- ✅ Shipper chỉ có thể accept orders có status = 'PENDING'

## Cách Deploy:

### Bước 1: Cập nhật Database
Chạy migration script để thêm cột `payment_method`:

```bash
cd backend
python migrate_add_payment_method.py
```

### Bước 2: Khởi động lại Backend
```bash
cd backend
python app.py
```

### Bước 3: Khởi động lại Frontend
```bash
cd frontend
npm run dev
```

## Tính năng mới:

### Customer:
- Có thể chọn phương thức thanh toán khi tạo order:
  - Cash (Tiền mặt)
  - Credit Card (Thẻ tín dụng)
  - E-Wallet (Ví điện tử)
  - Bank Transfer (Chuyển khoản ngân hàng)

### Shipper:
- Xem TẤT CẢ orders trong hệ thống (giống customer)
- Mỗi order có status badge rõ ràng:
  - 🟡 Đang chờ (PENDING) - Có thể accept
  - 🔵 Đã giao (ASSIGNED) - Không thể accept
  - 🟣 Đang giao (ONGOING)
  - 🟢 Hoàn thành (COMPLETED)
  - 🔴 Đã hủy (CANCELED)
- Chỉ có thể accept orders có status = PENDING
- Khi customer tạo order mới → Shipper tự động nhận được trong danh sách

## Kiểm tra:

1. **Test Customer tạo order:**
   - Login as customer
   - Tạo order mới với payment method
   - Kiểm tra order xuất hiện trong danh sách

2. **Test Shipper nhận order:**
   - Login as shipper
   - Refresh danh sách orders
   - Kiểm tra order mới của customer xuất hiện
   - Thử accept order có status = PENDING

## Database Schema Update:

```sql
-- Cột mới được thêm vào bảng app.orders:
ALTER TABLE app.orders 
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';
```

## API Changes:

### POST /orders
**Request body (updated):**
```json
{
  "pickup_address": "string",
  "delivery_address": "string",
  "distance_km": 5.0,
  "price_estimate": 35000,
  "payment_method": "cash" // NEW FIELD
}
```

### GET /deliveries/available
**Response (updated):**
```json
{
  "ok": true,
  "orders": [
    // Trả về TẤT CẢ orders, không chỉ PENDING
    // Mỗi order có thêm field payment_method
  ]
}
```
