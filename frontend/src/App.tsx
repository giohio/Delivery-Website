import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerCreateOrder from './pages/customer/CustomerCreateOrder';
import CustomerTrackOrder from './pages/customer/CustomerTrackOrder';
import CustomerWallet from './pages/customer/CustomerWallet';
import CustomerCoupons from './pages/customer/CustomerCoupons';
import CustomerProfile from './pages/customer/CustomerProfile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailSignUp from './pages/EmailSignUp';
import { MemberProtectedRoute } from './components/ui/member-protected-route';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCouriers from './pages/admin/AdminCouriers';
import AdminReports from './pages/admin/AdminReports';
import AdminKYCApproval from './pages/admin/AdminKYCApproval';

// Merchant Pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantOrders from './pages/merchant/MerchantOrders';
import MerchantAvailableOrders from './pages/merchant/MerchantAvailableOrders';
import MerchantCreateOrder from './pages/merchant/MerchantCreateOrder';
import MerchantDeliveries from './pages/merchant/MerchantDeliveries';
import MerchantPayments from './pages/merchant/MerchantPayments';

// Shipper Pages
import ShipperDashboard from './pages/shipper/ShipperDashboard';
import ShipperDeliveries from './pages/shipper/ShipperDeliveries';
import ShipperAvailableOrdersPage from './pages/shipper/ShipperAvailableOrdersPage';
import ShipperEarnings from './pages/shipper/ShipperEarnings';
import ShipperProfile from './pages/shipper/ShipperProfile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup/email" element={<EmailSignUp />} />
      <Route path="/customer" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <Navigate to="/customer/dashboard" replace />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/dashboard" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/orders" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerOrders />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/create-order" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerCreateOrder />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/track-order" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerTrackOrder />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/wallet" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerWallet />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/coupons" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerCoupons />
        </MemberProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerProfile />
        </MemberProtectedRoute>
      } />
      <Route path="/courier" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <Navigate to="/shipper/dashboard" replace />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <Navigate to="/shipper/dashboard" replace />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper/dashboard" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper/deliveries" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperDeliveries />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper/available-orders" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperAvailableOrdersPage />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper/earnings" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperEarnings />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper/profile" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperProfile />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <Navigate to="/merchant/dashboard" replace />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/dashboard" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/orders" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantOrders />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/available-orders" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantAvailableOrders />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/create-order" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantCreateOrder />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/deliveries" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantDeliveries />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant/payments" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantPayments />
        </MemberProtectedRoute>
      } />
      <Route path="/admin" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <Navigate to="/admin/dashboard" replace />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminOrders />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/couriers" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminCouriers />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminReports />
        </MemberProtectedRoute>
      } />
      <Route path="/admin/kyc-approvals" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminKYCApproval />
        </MemberProtectedRoute>
      } />
    </Routes>
  );
}
