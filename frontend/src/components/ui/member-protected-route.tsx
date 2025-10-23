import { Navigate } from 'react-router-dom';

interface MemberProtectedRouteProps {
  children: React.ReactNode;
  messageToSignIn?: string;
}

export function MemberProtectedRoute({ children, messageToSignIn }: MemberProtectedRouteProps) {
  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Redirect to home page if not authenticated
    console.log(messageToSignIn || 'Please sign in to access this page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
