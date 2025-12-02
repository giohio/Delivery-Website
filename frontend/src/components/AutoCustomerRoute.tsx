import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerDashboard from '../pages/customer/CustomerDashboard';

export const AutoCustomerRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
      return;
    }

    // If authenticated but not customer, redirect to appropriate dashboard
    if (user && user.role_name && user.role_name !== 'customer') {
      const roleRoutes: Record<string, string> = {
        shipper: '/shipper',
        merchant: '/dashboard/merchant',
        admin: '/admin'
      };
      
      const targetRoute = roleRoutes[user.role_name];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show customer dashboard if authenticated as customer
  if (isAuthenticated && user?.role_name === 'customer') {
    return <CustomerDashboard />;
  }

  // Show nothing while redirecting
  return null;
};
