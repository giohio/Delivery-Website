# Frontend Features Implementation Checklist

## 🎯 Missing Features to Implement

### 1. **Customer Dashboard** (Partially Done)
#### ✅ Already Implemented:
- View orders list
- Basic profile modal
- Order tracking modal

#### ❌ Need to Add:
- **Create New Order Form**
  - Pickup address input
  - Delivery address input
  - Distance calculation
  - Price estimation
  - API: `POST /orders`

- **Payment Integration**
  - Payment method selection (CASH/BANK/WALLET)
  - Create payment after order
  - API: `POST /payments/:order_id`

- **Rating System**
  - Rate completed deliveries
  - View rating history
  - API: `POST /ratings/:delivery_id`

- **Real Notifications**
  - Fetch from API instead of mock data
  - Mark as read functionality
  - API: `GET /notifications`, `PUT /notifications/:id/read`

- **Order Cancellation**
  - Cancel button for pending orders
  - API: `POST /orders/:order_id/cancel`

---

### 2. **Shipper Dashboard** (Missing Completely)
#### Need to Create:
- **Available Orders View**
  - List all pending orders
  - Accept multiple orders
  - API: `GET /deliveries/available`

- **Create Delivery**
  - Select orders to deliver
  - Set max capacity
  - API: `POST /deliveries`

- **My Deliveries**
  - View assigned deliveries
  - Update delivery status (ONGOING/COMPLETED/CANCELED)
  - API: `GET /deliveries/my`, `PUT /deliveries/:id/status`

- **Wallet Management**
  - View balance
  - View transaction history
  - API: `GET /wallet`, `GET /wallet/transactions`

- **Delivery Tracking**
  - Update location (lat/lng)
  - Add notes
  - API: `PUT /deliveries/:id/status`

- **Ratings Received**
  - View customer ratings
  - API: `GET /ratings/shipper/:shipper_id`

---

### 3. **Merchant Dashboard** (Missing Completely)
#### Need to Create:
- **Create Order for Customer**
  - Customer selection
  - Pickup/delivery addresses
  - Distance and price
  - API: `POST /merchant/orders`

- **View Merchant Orders**
  - List all orders created by merchant
  - Filter by status
  - API: `GET /merchant/orders`

- **View Deliveries**
  - Track deliveries for merchant orders
  - API: `GET /merchant/deliveries`

- **Payment Summary**
  - View all payments
  - Filter by status
  - API: `GET /merchant/payments`

---

### 4. **Admin Dashboard** (Partially Done)
#### ✅ Already Implemented:
- Basic dashboard layout
- User management table
- Statistics cards

#### ❌ Need to Add:
- **Real API Integration**
  - Dashboard summary stats
  - API: `GET /admin/summary`

- **Users Management**
  - List all users with roles
  - Filter by role
  - API: `GET /admin/users`

- **Orders Management**
  - View all orders
  - Filter by status
  - API: `GET /admin/orders`

- **Deliveries Management**
  - View all deliveries
  - Track delivery status
  - API: `GET /admin/deliveries`

- **Payment Refunds**
  - Force refund orders
  - API: `POST /admin/payments/:order_id/refund`

---

## 📁 Suggested File Structure

```
frontend/src/
├── pages/
│   ├── CustomerDashboard.tsx ✅ (needs updates)
│   ├── ShipperDashboard.tsx ❌ (create new)
│   ├── MerchantDashboard.tsx ❌ (create new)
│   └── AdminDashboard.tsx ✅ (needs API integration)
│
├── components/
│   ├── customer/
│   │   ├── CreateOrderModal.tsx ❌
│   │   ├── PaymentModal.tsx ❌
│   │   └── RatingModal.tsx ❌
│   │
│   ├── shipper/
│   │   ├── AvailableOrdersList.tsx ❌
│   │   ├── DeliveryCard.tsx ❌
│   │   ├── WalletWidget.tsx ❌
│   │   └── LocationTracker.tsx ❌
│   │
│   ├── merchant/
│   │   ├── CreateOrderForm.tsx ❌
│   │   ├── OrdersList.tsx ❌
│   │   └── PaymentsSummary.tsx ❌
│   │
│   └── admin/
│       ├── UsersTable.tsx ✅ (update with API)
│       ├── OrdersTable.tsx ❌
│       ├── DeliveriesTable.tsx ❌
│       └── RefundModal.tsx ❌
│
└── services/
    ├── orderApi.ts ❌
    ├── deliveryApi.ts ❌
    ├── paymentApi.ts ❌
    ├── walletApi.ts ❌
    ├── ratingApi.ts ❌
    ├── notificationApi.ts ❌
    └── adminApi.ts ✅ (partially done)
```

---

## 🔧 Priority Implementation Order

### Phase 1: Core Customer Features
1. Create Order Form with API integration
2. Payment Modal
3. Real Notifications
4. Order Cancellation

### Phase 2: Shipper Dashboard
1. Available Orders List
2. Create Delivery
3. Update Delivery Status
4. Wallet View

### Phase 3: Merchant Dashboard
1. Create Order for Customer
2. View Orders
3. View Deliveries
4. Payment Summary

### Phase 4: Admin Enhancements
1. Real API integration for all tables
2. Refund functionality
3. Advanced filtering

---

## 📝 Notes

- All backend APIs are ready and working
- Need to create API service files for each module
- Use Bearer token authentication for all requests
- Handle loading states and errors properly
- Add form validation
- Implement real-time updates (optional: WebSocket)

---

## 🎨 UI/UX Considerations

- Use consistent design patterns across dashboards
- Add loading skeletons
- Implement toast notifications for success/error
- Mobile responsive design
- Accessibility (ARIA labels, keyboard navigation)
