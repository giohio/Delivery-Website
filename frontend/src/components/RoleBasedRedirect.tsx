import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading or if already authenticated
    if (isLoading || !isAuthenticated || !user) return;

    // Don't redirect if already on a specific page
    const currentPath = location.pathname;
    if (currentPath !== '/' && currentPath !== '/login') return;

    // Redirect based on role
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
  }, [user, isAuthenticated, isLoading, navigate, location]);

  return null;
};
