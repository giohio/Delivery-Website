import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './pages/CustomerDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}
