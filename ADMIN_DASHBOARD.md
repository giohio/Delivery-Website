# Admin Dashboard - FastDelivery

## Tổng quan
Trang quản trị viên (Admin Dashboard) được thiết kế để quản lý và giám sát toàn bộ hệ thống FastDelivery.

## Tính năng chính

### 1. Bảng điều khiển tổng quan (Dashboard Overview)
- **Tổng người dùng**: Hiển thị tổng số người dùng trong hệ thống
- **Tổng đơn hàng**: Số lượng đơn hàng đã được tạo
- **Doanh thu**: Tổng doanh thu từ các đơn hàng thành công
- **Uptime hệ thống**: Tỷ lệ thời gian hệ thống hoạt động

### 2. Thống kê chi tiết
- **Tài xế hoạt động**: Số lượng tài xế đang hoạt động
- **Merchant hoạt động**: Số lượng merchant đang hoạt động
- **Thời gian giao TB**: Thời gian giao hàng trung bình
- **Hài lòng KH**: Điểm đánh giá trung bình của khách hàng

### 3. Hoạt động gần đây
Hiển thị các hoạt động gần đây trong hệ thống:
- Đơn hàng hoàn thành
- Người dùng mới đăng ký
- Cảnh báo hệ thống
- Nâng cấp gói dịch vụ

### 4. Tổng quan đơn hàng
- **Hoàn thành**: Số đơn hàng đã hoàn thành
- **Đang xử lý**: Số đơn hàng đang được xử lý
- **Đã hủy**: Số đơn hàng đã bị hủy
- **Tỷ lệ thành công**: Phần trăm đơn hàng hoàn thành thành công

### 5. Quản lý người dùng
Bảng quản lý người dùng với các tính năng:
- **Tìm kiếm**: Tìm kiếm người dùng theo tên hoặc email
- **Lọc theo vai trò**: Khách hàng, Tài xế, Merchant, Admin
- **Lọc theo trạng thái**: Hoạt động, Tạm khóa
- **Thao tác**:
  - Xem chi tiết người dùng
  - Chỉnh sửa thông tin
  - Khóa/Kích hoạt tài khoản

## Backend API Integration

### Endpoints được sử dụng

#### 1. GET `/admin/summary`
Lấy thống kê tổng quan của hệ thống
```json
{
  "ok": true,
  "summary": {
    "total_users": 15420,
    "total_orders": 45680,
    "total_deliveries": 42150,
    "total_payments": 42150,
    "revenue": 125000000
  }
}
```

#### 2. GET `/admin/users`
Lấy danh sách tất cả người dùng
```json
{
  "ok": true,
  "users": [
    {
      "user_id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phone": "0123456789",
      "role_name": "driver",
      "is_active": true,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### 3. GET `/admin/orders`
Lấy danh sách tất cả đơn hàng
```json
{
  "ok": true,
  "orders": [...]
}
```

#### 4. GET `/admin/deliveries`
Lấy danh sách tất cả giao hàng
```json
{
  "ok": true,
  "deliveries": [...]
}
```

#### 5. POST `/admin/payments/:order_id/refund`
Hoàn tiền cho một đơn hàng
```json
{
  "ok": true,
  "payment": {...}
}
```

## Cấu trúc File

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   └── AdminDashboard.tsx    # Component chính
│   │   └── ui/
│   │       ├── avatar.tsx            # Component Avatar
│   │       ├── tabs.tsx              # Component Tabs
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── badge.tsx
│   └── services/
│       └── adminApi.ts               # Service gọi API backend
```

### Backend
```
backend/
└── routes/
    └── admin.py                      # Routes cho admin
```

## Cách sử dụng

### 1. Truy cập trang Admin
- URL: `/dashboard/admin`
- Yêu cầu: Đăng nhập với tài khoản admin

### 2. Xem thống kê
- Các thống kê được tự động tải khi vào trang
- Dữ liệu được lấy từ backend qua API

### 3. Quản lý người dùng
- Sử dụng ô tìm kiếm để tìm người dùng
- Chọn bộ lọc vai trò và trạng thái
- Click vào icon để thực hiện các thao tác

### 4. Làm mới dữ liệu
- Reload trang để cập nhật dữ liệu mới nhất

## Authentication
Tất cả các API endpoint yêu cầu:
- Header: `Authorization: Bearer <token>`
- Token được lưu trong `localStorage` với key `authToken`
- Chỉ admin mới có quyền truy cập các endpoint này

## Xử lý lỗi
- Nếu API thất bại, hệ thống sẽ hiển thị dữ liệu mock
- Loading state được hiển thị khi đang tải dữ liệu
- Console log được sử dụng để debug lỗi

## Tính năng tương lai
- [ ] Real-time updates với WebSocket
- [ ] Export dữ liệu ra Excel/CSV
- [ ] Biểu đồ thống kê chi tiết
- [ ] Quản lý đơn hàng trực tiếp
- [ ] Hệ thống thông báo
- [ ] Phân quyền chi tiết hơn
