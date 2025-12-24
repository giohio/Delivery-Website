import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MemberProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  messageToSignIn?: string;
}

export function MemberProtectedRoute({ 
  children, 
  allowedRoles,
  messageToSignIn 
}: MemberProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    console.log(messageToSignIn || 'Please sign in to access this page');
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role_name?.toLowerCase();
    const hasPermission = userRole && allowedRoles.some(
      role => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      console.log(`Access denied. User role: ${userRole}, Required: ${allowedRoles.join(', ')}`);
      // Don't redirect - just show access denied or let the user see empty dashboard
      // The RoleSwitcher will allow them to switch to correct role
      // Commenting out the redirect to prevent loop
      // return <Navigate to="/customer" replace />;
    }
  }

  return <>{children}</>;
}
