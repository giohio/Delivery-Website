import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CourierDashboard from './pages/CourierDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminDashboard from './components/pages/AdminDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailSignUp from './pages/EmailSignUp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup/email" element={<EmailSignUp />} />
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/courier" element={<CourierDashboard />} />
      <Route path="/merchant" element={<MerchantDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
