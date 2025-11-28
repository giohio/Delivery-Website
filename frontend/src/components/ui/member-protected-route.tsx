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
      // Redirect to appropriate dashboard based on user's role
      switch (userRole) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'merchant':
          return <Navigate to="/merchant" replace />;
        case 'shipper':
        case 'courier':
          return <Navigate to="/courier" replace />;
        case 'customer':
          return <Navigate to="/customer" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
}
