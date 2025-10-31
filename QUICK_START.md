# 🚀 Quick Start Guide - FastShip

## ⚡ Chạy hệ thống trong 5 phút

### Bước 1: Start Database (Terminal 1)
```bash
docker start my-postgres
```

Nếu chưa có container:
```bash
docker run --name my-postgres ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=postgres_db_delivery_web ^
  -e POSTGRES_DB=delivery_db ^
  -p 5432:5432 ^
  -d postgres
```

✅ Kiểm tra: `docker ps` - thấy my-postgres running

---

### Bước 2: Start Backend (Terminal 2)
```bash
cd "D:\Delivery website\backend"
python app.py
```

✅ Kiểm tra: Thấy `Running on http://127.0.0.1:5000`

**Lần đầu chạy:** Seed data
```bash
# Terminal 3
cd "D:\Delivery website\backend"
python seed_data.py
```

---

### Bước 3: Start Frontend (Terminal 4)
```bash
cd "D:\Delivery website\frontend"
npm run dev
```

✅ Kiểm tra: Mở http://localhost:5173

---

## 🎭 Test Accounts

| Role | Username | Password |
|------|----------|----------|
| 👤 Customer | customer1 | customer123 |
| 🚚 Shipper | shipper1 | shipper123 |
| 🏪 Merchant | merchant1 | merchant123 |
| 👑 Admin | admin | admin123 |

---

## 🧪 Quick Test Flow

### 1. Test Customer (5 phút)
1. Login: customer1 / customer123
2. Click "Create New Order"
3. Fill form:
   - Pickup: "123 Nguyen Hue, Dist 1"
   - Delivery: "456 Le Loi, Dist 3"
   - Distance: 5
4. Click "Create Order"
5. ✅ Order mới xuất hiện với status "Đang giao"
6. Click "Pay" → Choose "Cash on Delivery"
7. ✅ Thấy success message

### 2. Test Shipper (5 phút)
1. Logout → Login: shipper1 / shipper123
2. Tab "Available Orders" → Thấy order vừa tạo
3. Click chọn order → "Accept Orders"
4. ✅ Order xuất hiện trong "My Deliveries"
5. Click "Start Delivery"
6. Click "Complete Delivery"
7. Tab "Wallet" → ✅ Balance tăng lên

### 3. Test Rating (2 phút)
1. Logout → Login lại: customer1 / customer123
2. Order đã COMPLETED → Click "Rate" ⭐
3. Chọn 5 sao
4. Comment: "Great!"
5. Submit Rating
6. ✅ Thấy success message

---

## 📊 Complete Flow Diagram

```
CUSTOMER                SHIPPER                 SYSTEM
   |                       |                       |
   |-- Create Order ------>|                       |
   |                       |                       |-- Order PENDING
   |                       |                       |
   |-- Pay ---------------->|                       |
   |                       |                       |-- Payment PENDING
   |                       |                       |
   |                       |-- View Available ---->|
   |                       |                       |-- Show orders
   |                       |                       |
   |                       |-- Accept Orders ----->|
   |                       |                       |-- Order ASSIGNED
   |                       |                       |-- Delivery created
   |                       |                       |
   |                       |-- Start Delivery ---->|
   |                       |                       |-- Delivery ONGOING
   |                       |                       |
   |                       |-- Complete ---------->|
   |                       |                       |-- Delivery COMPLETED
   |                       |                       |-- Order COMPLETED
   |                       |                       |-- Payment SUCCESS
   |                       |                       |-- Wallet CREDITED
   |                       |                       |
   |-- Rate Delivery ----->|                       |
   |                       |                       |-- Rating saved
```

---

## 🎯 Features Checklist

### ✅ Customer Features
- [x] Create order với form đầy đủ
- [x] Payment (Cash/Bank/Wallet)
- [x] View orders list
- [x] Track order
- [x] Rate completed delivery
- [x] View notifications
- [x] Update profile

### ✅ Shipper Features
- [x] View available orders
- [x] Accept multiple orders
- [x] Start delivery
- [x] Complete delivery
- [x] View wallet balance
- [x] View transaction history

### ✅ Merchant Features
- [x] Create order for customer
- [x] View merchant orders
- [x] View deliveries
- [x] View payments

### ✅ Admin Features
- [x] View dashboard statistics
- [x] View all users
- [x] View all orders
- [x] View all deliveries
- [x] Process refunds

---

## 🔧 Troubleshooting

### Lỗi: Cannot connect to database
```bash
# Check database
docker ps

# Nếu không chạy
docker start my-postgres

# Check logs
docker logs my-postgres
```

### Lỗi: Port 5000 already in use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Lỗi: Module not found
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Lỗi: 401 Unauthorized
- Token expired → Login lại
- Check `localStorage.getItem('token')` trong browser console

---

## 📁 Project Structure

```
Delivery website/
├── backend/
│   ├── app.py              # Flask app
│   ├── db.py               # Database connection
│   ├── seed_data.py        # Test data
│   ├── routes/             # API endpoints
│   │   ├── auth.py
│   │   ├── orders.py
│   │   ├── deliveries.py
│   │   ├── payments.py
│   │   ├── wallets.py
│   │   ├── ratings.py
│   │   ├── notifications.py
│   │   ├── merchant.py
│   │   └── admin.py
│   └── utils/
│       └── auth.py         # JWT helpers
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── customer/   # Modals
│   │   ├── pages/          # Dashboards
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── ShipperDashboard.tsx
│   │   │   └── MerchantDashboard.tsx
│   │   ├── services/       # API calls
│   │   │   ├── orderApi.ts
│   │   │   ├── paymentApi.ts
│   │   │   ├── deliveryApi.ts
│   │   │   └── ...
│   │   └── contexts/
│   │       └── AuthContext.tsx
│   └── .env
│
└── Documentation/
    ├── COMPLETE_WORKFLOW_GUIDE.md  # Chi tiết flow
    ├── COMPLETED_IMPLEMENTATION.md # Tổng hợp code
    └── QUICK_START.md              # Guide này
```

---

## 🎉 Success Indicators

Hệ thống hoạt động tốt khi:

✅ Database running (docker ps shows my-postgres)  
✅ Backend running (http://localhost:5000)  
✅ Frontend running (http://localhost:5173)  
✅ Login thành công  
✅ Customer tạo order → Order hiện ra  
✅ Customer thanh toán → Success  
✅ Shipper nhận order → Order biến mất khỏi available  
✅ Shipper complete → Wallet tăng  
✅ Customer rate → Success  

---

## 🚀 Ready!

**Hệ thống đã sẵn sàng!** 

Giờ bạn có thể:
1. Test toàn bộ flow
2. Xem code để hiểu cách hoạt động
3. Customize theo nhu cầu
4. Deploy lên production

**Happy Coding!** 🎊
