# Fix Order Status Sync Issue

## Vấn đề:
Đơn hàng ở customer dashboard hiển thị status "Chờ xử lý" (PENDING), nhưng ở shipper dashboard đã "Completed". Đây là vấn đề đồng bộ giữa bảng `orders` và `deliveries`.

## Nguyên nhân:
- Khi shipper complete delivery, status trong bảng `deliveries` được update
- Nhưng status trong bảng `orders` đôi khi không được sync đúng
- Customer chỉ query từ bảng `orders` nên thấy status cũ

## Giải pháp đã áp dụng:

### 1. Cập nhật Backend Logic

#### A. Thêm update ONGOING status (`routes/deliveries.py`)
- Khi delivery chuyển sang ONGOING → orders cũng chuyển sang ONGOING
- Khi delivery chuyển sang COMPLETED → orders chuyển sang COMPLETED
- Thêm logging để debug

#### B. Auto-sync khi customer query orders (`routes/orders.py`)
- Endpoint `GET /orders` bây giờ:
  - JOIN với bảng `deliveries` để lấy status thực tế
  - Tự động sync status nếu khác nhau
  - Trả về status đã được sync

### 2. Script Fix Data Hiện Tại

Chạy script để fix các orders đã bị lỗi sync:

```bash
cd backend
python fix_order_status_sync.py
```

Script này sẽ:
- Tìm tất cả orders có status khác với delivery status
- Update orders để match với delivery status
- Hiển thị danh sách orders đã được fix

### 3. Khởi động lại Backend

```bash
cd backend
python app.py
```

## Cách kiểm tra:

### Test 1: Fix orders hiện tại
```bash
# Chạy fix script
python fix_order_status_sync.py

# Kết quả mong đợi:
# ✓ Fixed X orders:
#   - Order #2024001236 → COMPLETED
#   - Order #2024001234 → COMPLETED
```

### Test 2: Customer refresh orders
1. Login as customer
2. Refresh trang dashboard (F5)
3. Kiểm tra status của orders đã được cập nhật

### Test 3: Shipper complete new delivery
1. Login as shipper
2. Accept một order mới
3. Click "Complete Delivery"
4. Login as customer → Kiểm tra order status đã COMPLETED

## Các thay đổi code:

### `backend/routes/deliveries.py`
```python
# Thêm logic update ONGOING
if new_status == "ONGOING":
    cur.execute("""
        UPDATE app.orders
           SET status = 'ONGOING'
         WHERE delivery_id = %s;
    """, (delivery_id,))
```

### `backend/routes/orders.py`
```python
# Auto-sync status khi query
SELECT 
    o.*,
    COALESCE(d.status, o.status) as actual_status
FROM app.orders o
LEFT JOIN app.deliveries d ON o.delivery_id = d.delivery_id
WHERE o.customer_id = %s;

# Update nếu khác nhau
if row['actual_status'] != row['status']:
    UPDATE app.orders SET status = %s WHERE order_id = %s;
```

## Lưu ý:
- Từ bây giờ, mỗi khi customer load orders, status sẽ tự động được sync
- Không cần chạy fix script nữa sau khi đã fix lần đầu
- Nếu vẫn thấy lỗi, check backend logs để debug
