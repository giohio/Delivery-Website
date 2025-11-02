import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './components/pages/CustomerDashboard';
import ShipperDashboard from './pages/ShipperDashboardModern';
import MerchantDashboard from './pages/MerchantDashboardNew';
import AdminDashboard from './components/pages/AdminDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailSignUp from './pages/EmailSignUp';
import { MemberProtectedRoute } from './components/ui/member-protected-route';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup/email" element={<EmailSignUp />} />
      <Route path="/customer" element={
        <MemberProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/courier" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/shipper" element={
        <MemberProtectedRoute allowedRoles={['shipper', 'courier']}>
          <ShipperDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/merchant" element={
        <MemberProtectedRoute allowedRoles={['merchant']}>
          <MerchantDashboard />
        </MemberProtectedRoute>
      } />
      <Route path="/admin" element={
        <MemberProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </MemberProtectedRoute>
      } />
    </Routes>
  );
}
