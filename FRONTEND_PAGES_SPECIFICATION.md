# 🚚 DELIVERY SYSTEM - FRONTEND PAGES SPECIFICATION

## 📋 **TABLE OF CONTENTS**
1. [Tổng quan hệ thống](#overview)
2. [Authentication Pages](#auth)
3. [Customer Pages](#customer)
4. [Shipper Pages](#shipper)
5. [Merchant Pages](#merchant)
6. [Admin Pages](#admin)
7. [Common Components](#common)
8. [Missing Features & TODOs](#todos)

---

## 🌐 **TỔNG QUAN HỆ THỐNG** {#overview}

**Stack:** React + TypeScript + Vite + Tailwind CSS + Leaflet Maps
**Backend:** Flask + PostgreSQL
**Auth:** JWT tokens in sessionStorage (tab-isolated)

**Roles:**
- 🛒 **Customer** - Tạo đơn, thanh toán, tracking, rating
- 🏍️ **Shipper** - Nhận đơn, giao hàng, nhận tiền wallet
- 🏪 **Merchant** - Quản lý đơn bán hàng, API integration
- 👨‍💼 **Admin** - Quản trị toàn hệ thống

---

## 🔐 **1. AUTHENTICATION PAGES** {#auth}

### 📄 **1.1. Landing Page** (`/`)
**File:** `frontend/src/components/pages/LandingPage.tsx`

**Sections:**
- ✅ Hero Section (CTA: "Get Started")
- ✅ How It Works (3 steps)
- ✅ Benefits Section
- ✅ Pricing Cards
- ✅ FAQ Accordion
- ✅ Driver/Merchant Sections
- ✅ Footer

**Navigation:**
- Auto-redirect to customer dashboard if logged in
- Login/Signup buttons in header

---

### 📄 **1.2. Login Page** (`/login`)
**File:** `frontend/src/pages/Login.tsx`

**Features:**
- ✅ Email + Password login
- ✅ Firebase Google Sign-In
- ✅ Role selection (Customer/Shipper/Merchant/Admin)
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Redirect to role-specific dashboard

**Improvements Needed:**
- ❌ Password visibility toggle
- ❌ Loading spinner during login
- ❌ Better error messages

---

### 📄 **1.3. Sign Up Page** (`/signup`)
**File:** `frontend/src/pages/SignUp.tsx`

**Features:**
- ✅ Email, Password, Full Name, Phone, Role
- ✅ Password confirmation
- ✅ Firebase integration

**Missing:**
- ❌ Terms & Conditions checkbox
- ❌ Email verification flow
- ❌ Password strength indicator

---

## 🛒 **2. CUSTOMER PAGES** {#customer}

### 📄 **2.1. Customer Dashboard** (`/customer-dashboard`)
**File:** `frontend/src/components/pages/CustomerDashboard.tsx`

#### **Current Features:**

**Header:**
- ✅ Logo + Brand name
- ✅ Search bar (placeholder)
- ✅ Notification bell (with count badge)
- ✅ User menu dropdown:
  - Profile (with ProfileModal)
  - Settings (ChangePasswordModal)
  - Logout

**Stats Cards:**
- ✅ Total Orders
- ✅ Completed Orders
- ✅ Pending Orders
- ✅ Total Spent

**Main Actions:**
- ✅ "Create New Order" button → CreateOrderModal with:
  - Interactive Leaflet map
  - Geocoding (Nominatim API)
  - Weather data (Open-Meteo API)
  - Auto distance calculation
  - Dynamic pricing with weather surcharge
  - Save coordinates to DB

**Orders List:**
- ✅ Filter tabs: All / Pending / In Transit / Completed
- ✅ Order cards with:
  - Status badge
  - Pickup/delivery addresses with MapPin icons
  - Price (formatted with vi-VN locale)
  - Timestamp
  - Actions: View Details, Track, Pay, Rate
- ✅ Rating system:
  - Rate button (only for completed orders)
  - Hide button after rating submitted
  - Show "Rated" badge with star
- ✅ PaymentModal (COD/Credit Card/Wallet)
- ✅ RatingModal (1-5 stars + comment)

**Notifications Panel:**
- ✅ Slide-in from right
- ✅ Mark as read
- ✅ Real-time updates (polling)

#### **Missing Features:**

**Header Enhancements:**
- ❌ Global search functionality (search orders by ID/address)
- ❌ Quick actions menu (floating button)
- ❌ Real-time notification websocket

**Dashboard Improvements:**
- ❌ Biểu đồ thống kê chi tiêu theo tháng (Line Chart)
- ❌ Top 5 địa chỉ giao hàng thường xuyên
- ❌ Lịch sử giao dịch wallet
- ❌ Mã giảm giá / Promotions section
- ❌ Saved addresses list (địa chỉ mặc định)

**Order Management:**
- ❌ Bulk actions (cancel multiple orders)
- ❌ Export orders to PDF/CSV
- ❌ Advanced filters (date range, price range, status)
- ❌ Order history timeline with map tracking
- ❌ Reorder button (tạo lại order y hệt)

**Profile & Settings:**
- ✅ ProfileModal (update name, phone)
- ✅ ChangePasswordModal
- ❌ Avatar upload
- ❌ Default addresses management
- ❌ Payment methods (add/remove cards)
- ❌ Notification preferences
- ❌ Language selection
- ❌ 2FA setup

---

### 📄 **2.2. Order Tracking Page** (`/track/:orderId`)
**Status:** ❌ **NOT IMPLEMENTED**

**Should Include:**
- Real-time shipper location on map
- Order status timeline
- Shipper info (name, phone, rating, vehicle)
- ETA countdown
- Live chat with shipper
- POD (Proof of Delivery) photo
- Share tracking link

---

## 🏍️ **3. SHIPPER PAGES** {#shipper}

### 📄 **3.1. Shipper Dashboard** (`/shipper-dashboard`)
**File:** `frontend/src/pages/ShipperDashboardModern.tsx`

#### **Current Features:**

**Header:**
- ✅ Logo
- ✅ User menu:
  - Profile → ShipperProfileModal (3 tabs: Personal, KYC, Bank)
  - Settings → ChangePasswordModal
  - Logout

**Stats Cards:**
- ✅ Available Orders
- ✅ Today's Earnings
- ✅ Total Deliveries
- ✅ Average Rating

**Main Section - 3 Tabs:**

**Tab 1: Available Orders**
- ✅ List of unassigned orders
- ✅ Show pickup/delivery addresses, price, distance
- ✅ "Accept Order" button
- ✅ Refresh button

**Tab 2: Current Delivery**
- ✅ Show active delivery details
- ✅ Customer info, addresses, price
- ✅ Status update buttons:
  - "Start Delivery"
  - "Mark Picked Up"
  - "Mark Delivered"
- ✅ Display rating after completion (if rated)
- ✅ Show rating score or "No rating yet"

**Tab 3: Wallet**
- ✅ Current balance
- ✅ Wallet history (transactions)
- ✅ Withdraw button (placeholder)

**Modals:**
- ✅ ShipperProfileModal with 3 tabs:
  - **Personal Info:** Name, phone, operating area
  - **KYC & Vehicle:** CCCD, driver license, vehicle type, license plate, images
  - **Bank Account:** Bank name, account number, account name
- ✅ Verification status badge (Pending/Approved/Rejected)
- ✅ ChangePasswordModal

#### **Missing Features:**

**Dashboard Enhancements:**
- ❌ Biểu đồ thu nhập theo ngày/tuần/tháng
- ❌ Heat map khu vực giao hàng nhiều nhất
- ❌ Lịch làm việc (calendar view)
- ❌ Performance metrics (on-time delivery rate, customer satisfaction)
- ❌ Leaderboard (top shippers)

**Order Management:**
- ❌ Map view of available orders (cluster markers)
- ❌ Auto-assign orders by GPS proximity
- ❌ Route optimization (multiple orders)
- ❌ Order history with filters
- ❌ Export earnings report to PDF

**Real-time Features:**
- ❌ GPS tracking while on delivery
- ❌ Live chat with customer
- ❌ Push notifications for new orders
- ❌ Audio alert for nearby orders

**Wallet Improvements:**
- ❌ Real withdraw functionality (to bank account)
- ❌ Transaction details modal
- ❌ Earnings breakdown (base fare, distance, tips, bonuses)
- ❌ Tax documents export

**KYC Enhancements:**
- ✅ Form with 3 tabs
- ❌ Real file upload (currently placeholder)
- ❌ Document preview
- ❌ Rejection reason display (if rejected by admin)
- ❌ Re-submit KYC button

---

## 🏪 **4. MERCHANT PAGES** {#merchant}

### 📄 **4.1. Merchant Dashboard** (`/merchant-dashboard`)
**File:** `frontend/src/pages/MerchantDashboardNew.tsx`

#### **Current Features:**
- ✅ Basic dashboard structure
- ✅ Stats cards (placeholder)
- ✅ Order list (placeholder)

#### **Missing Features (CRITICAL):**

**Dashboard:**
- ❌ Revenue statistics (today, week, month, year)
- ❌ Biểu đồ doanh thu (Line/Bar chart)
- ❌ Top selling products/services
- ❌ Order volume by status
- ❌ Average order value

**Order Management:**
- ❌ Create delivery request for customer
- ❌ Bulk order creation via CSV upload
- ❌ Order tracking for merchant
- ❌ COD collection status
- ❌ Settlement reports (đối soát)

**Shop Profile:**
- ❌ Shop info (name, logo, address, tax ID)
- ❌ Business license verification
- ❌ Operating hours
- ❌ Service areas

**API Integration:**
- ❌ Generate API tokens
- ❌ API documentation viewer
- ❌ Webhook configuration
- ❌ API usage statistics
- ❌ Test API calls playground

**Staff Management:**
- ❌ Add/remove staff accounts
- ❌ Role-based permissions
- ❌ Activity logs

**Financial:**
- ❌ COD settlement account setup
- ❌ Payout history
- ❌ Invoice generation
- ❌ Transaction reports

---

## 👨‍💼 **5. ADMIN PAGES** {#admin}

### 📄 **5.1. Admin Dashboard** (`/admin-dashboard`)
**File:** `frontend/src/components/pages/AdminDashboard.tsx`

#### **Current Features:**
- ✅ Basic structure
- ❌ Most features not implemented

#### **Missing Features (HIGH PRIORITY):**

**Overview Dashboard:**
- ❌ System-wide statistics:
  - Total users by role
  - Active deliveries
  - Total revenue (today, month, year)
  - Platform commission earned
- ❌ Biểu đồ:
  - User growth (Line chart)
  - Order volume trends
  - Revenue breakdown by role
  - Geographic distribution (map)

**User Management:**
- ❌ List all users (table with pagination, search, filters)
- ❌ User detail modal:
  - Personal info
  - Activity history
  - Orders/deliveries count
  - Revenue contribution
- ❌ Actions:
  - Block/Unblock user
  - Reset password
  - Change role
  - Delete account

**KYC Approval Dashboard:**
- ❌ List pending KYC submissions
- ❌ KYC detail modal with:
  - ID card images (front/back)
  - Driver license image
  - Vehicle image
  - License plate
  - Bank account info
- ❌ Actions:
  - ✅ Approve
  - ❌ Reject (with reason)
  - View history
- ❌ Filters: Pending / Approved / Rejected
- ❌ Bulk actions

**Order Monitoring:**
- ❌ Real-time order map (all active deliveries)
- ❌ Order list with advanced filters
- ❌ Dispute resolution
- ❌ Refund management

**Financial Management:**
- ❌ Platform earnings dashboard
- ❌ Commission settings
- ❌ Shipper payouts queue
- ❌ Merchant settlements
- ❌ Transaction logs
- ❌ Export financial reports

**System Configuration:**
- ❌ Pricing rules (base fare, per km rate, surge pricing)
- ❌ Platform commission rates
- ❌ Service areas management
- ❌ Notification templates
- ❌ Email/SMS settings
- ❌ Feature flags

**Analytics & Reports:**
- ❌ User behavior analytics
- ❌ Delivery performance metrics
- ❌ Revenue reports
- ❌ Export to PDF/Excel

---

## 🧩 **6. COMMON COMPONENTS** {#common}

### ✅ **Implemented:**
- Header with user menu
- Notification panel
- ProfileModal (Customer)
- ChangePasswordModal
- ShipperProfileModal (3 tabs)
- CreateOrderModal (with map, geocoding, weather)
- PaymentModal
- RatingModal

### ❌ **Missing:**
- Toast notifications component
- Loading skeleton screens
- Error boundary
- Confirmation dialogs
- Image viewer/lightbox
- File uploader component
- Date range picker
- Advanced data table with sorting/filtering
- Charts library integration (Recharts/Chart.js)
- Map cluster markers
- Chat widget

---

## ⚠️ **7. CRITICAL MISSING FEATURES** {#todos}

### 🔴 **HIGH PRIORITY:**

1. **File Upload System**
   - Avatar upload
   - KYC documents upload (ID, license, vehicle photos)
   - POD (Proof of Delivery) photos
   - Merchant shop logo
   - Integration: AWS S3 / Cloudinary / local storage

2. **Admin KYC Approval**
   - Full dashboard to review shipper documents
   - Approve/Reject workflow
   - Email notifications

3. **Real-time Tracking**
   - GPS tracking during delivery
   - Live map updates
   - Shipper → Customer location sharing

4. **Merchant Full Implementation**
   - API integration dashboard
   - Bulk order creation
   - COD settlement system

5. **Payment Gateway Integration**
   - Stripe / PayPal / VNPay
   - Wallet top-up
   - Auto-payout to shippers

6. **Notifications System**
   - WebSocket for real-time updates
   - Push notifications (web push API)
   - Email notifications (SendGrid / AWS SES)
   - SMS notifications (Twilio)

### 🟡 **MEDIUM PRIORITY:**

7. **Address Management**
   - Save multiple addresses
   - Set default address
   - Auto-complete address input

8. **Advanced Analytics**
   - Charts & graphs for all dashboards
   - Export reports
   - Drill-down analytics

9. **Chat System**
   - Customer ↔ Shipper chat
   - Admin support chat
   - File sharing in chat

10. **Promotions & Coupons**
    - Promo code system
    - Discount rules
    - Referral program

### 🟢 **LOW PRIORITY:**

11. **2FA Security**
    - SMS OTP
    - Email OTP
    - Authenticator app

12. **Multi-language Support**
    - i18n implementation
    - Language switcher

13. **Dark Mode**
    - Theme toggle
    - Persistent user preference

14. **Mobile App**
    - React Native version
    - Deep linking

---

## 📊 **PROGRESS SUMMARY**

| Feature Category | Status | Progress |
|------------------|--------|----------|
| Authentication | ✅ Done | 100% |
| **NEW: Layouts System** | 🟡 In Progress | 80% |
| Customer Dashboard | 🟡 Refactoring | 70% |
| Shipper Dashboard | 🟡 Partial | 70% |
| Merchant Dashboard | 🔴 Minimal | 10% |
| Admin Dashboard | 🔴 Minimal | 5% |
| Profile & Settings | ✅ Done | 90% |
| Order Management | 🟡 Partial | 50% |
| Payment System | 🟡 Partial | 40% |
| Notifications | 🟡 Basic | 30% |
| Real-time Features | 🔴 Missing | 0% |
| File Upload | 🔴 Missing | 0% |
| Analytics | 🟡 Started | 20% |

## 🔄 **CURRENT REFACTORING STATUS** (Nov 13, 2025)

### ✅ **Completed:**
1. **Dependencies Installed:**
   - ✅ recharts (charts library)
   - ✅ framer-motion (animations)

2. **New Layouts Created:**
   - ✅ `layouts/DashboardLayout.tsx` - Reusable sidebar layout
   - ✅ `layouts/AuthLayout.tsx` - Login/Signup pages
   - ✅ `layouts/AdminLayout.tsx` - Admin-specific layout

3. **New Structure:**
   - ✅ `/pages/customer/` folder created
   - ✅ `/pages/courier/` folder created
   - ✅ `/pages/merchant/` folder created
   - ✅ `/pages/admin/` folder created

4. **New Pages:**
   - ✅ `CustomerDashboard.tsx` (new modern version with charts)

### � **In Progress:**
- Updating Router.tsx to support new routes
- Migrating old components to new structure
- Creating remaining customer pages

### 📋 **Next Steps:**
1. Complete Customer pages (Orders, CreateOrder, TrackOrder, Wallet, Profile)
2. Refactor Courier/Shipper pages
3. Build Merchant pages
4. Build Admin pages
5. Implement File Upload system
6. Build Admin KYC Approval dashboard

---

## 🎨 **UI/UX STANDARDS**

**Design System:**
- Primary Color: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Font: Inter / System Default
- Icons: Lucide React

**Layout:**
- Responsive: Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar: Fixed on desktop, collapsible on mobile
- Cards: Shadow-sm, rounded-lg, hover effects
- Buttons: Solid, outline, ghost variants
- Forms: Floating labels, inline validation

**Animation:**
- Smooth transitions (200-300ms)
- Fade in/out for modals
- Slide for notifications
- Loading spinners
- Skeleton screens

---

## 🚀 **NEXT STEPS**

### **Phase 1: Complete Core Features (Week 1-2)**
1. ✅ Fix all compilation errors
2. ✅ Customer profile & password change
3. ✅ Shipper KYC form
4. ❌ Admin KYC approval dashboard
5. ❌ File upload system

### **Phase 2: Merchant & Admin (Week 3-4)**
6. ❌ Merchant dashboard full implementation
7. ❌ Admin user management
8. ❌ Admin financial dashboard
9. ❌ System configuration panel

### **Phase 3: Real-time & Advanced (Week 5-6)**
10. ❌ GPS tracking
11. ❌ WebSocket notifications
12. ❌ Chat system
13. ❌ Analytics dashboards

### **Phase 4: Polish & Deploy (Week 7-8)**
14. ❌ Performance optimization
15. ❌ Security audit
16. ❌ Testing (unit, integration, E2E)
17. ❌ Documentation
18. ❌ Deployment (Docker + AWS/GCP)

---

**Last Updated:** 2025-11-13
**Maintainer:** Development Team
**Version:** 1.0.0-beta
