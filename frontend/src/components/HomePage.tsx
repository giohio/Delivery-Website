import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Get saved path from sessionStorage (tab-specific) or localStorage
      const savedPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
      
      if (savedPath) {
        navigate(savedPath, { replace: true });
        return;
      }

      // Fallback: redirect based on role
      const roleRoutes: Record<string, string> = {
        customer: '/customer',
        shipper: '/shipper',
        merchant: '/dashboard/merchant',
        admin: '/admin'
      };

      const targetRoute = roleRoutes[user.role_name || ''];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f3f4f6' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>FastDelivery</h1>
      <p style={{ marginBottom: '1rem' }}>Welcome to FastDelivery!</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="/customer" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
          Customer Dashboard
        </a>
        <a href="/shipper" style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
          Shipper Dashboard
        </a>
        <a href="/dashboard/merchant" style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
          Merchant Dashboard
        </a>
        <a href="/admin" style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
          Admin Dashboard
        </a>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test Accounts:</h2>
        <ul style={{ listStyle: 'disc', marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Customer:</strong> customer1 / customer123</li>
          <li><strong>Shipper:</strong> shipper1 / shipper123</li>
          <li><strong>Merchant:</strong> merchant1 / merchant123</li>
          <li><strong>Admin:</strong> admin / admin123</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
