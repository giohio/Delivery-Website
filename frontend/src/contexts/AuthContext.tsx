import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role_id?: number;
  role_name?: string;
  user_id?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  getToken: () => string | null;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage (tab-specific) or localStorage (fallback)
  useEffect(() => {
    // First check sessionStorage (tab-specific)
    let savedUser = sessionStorage.getItem('user');
    let savedToken = sessionStorage.getItem('token');
    
    // If not in sessionStorage, check localStorage (for persistence across sessions)
    if (!savedUser || !savedToken) {
      savedUser = localStorage.getItem('user');
      savedToken = localStorage.getItem('token');
      
      // If found in localStorage, copy to sessionStorage for this tab
      if (savedUser && savedToken) {
        sessionStorage.setItem('user', savedUser);
        sessionStorage.setItem('token', savedToken);
      }
    }
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    
    // Save to both sessionStorage (tab-specific) and localStorage (persistence)
    const userJson = JSON.stringify(userData);
    sessionStorage.setItem('user', userJson);
    localStorage.setItem('user', userJson);
    
    if (token) {
      sessionStorage.setItem('token', token);
      localStorage.setItem('token', token);
    }
    
    // Save role-based default path
    const roleRoutes: Record<string, string> = {
      customer: '/customer',
      shipper: '/shipper',
      merchant: '/dashboard/merchant',
      admin: '/admin'
    };
    const defaultPath = roleRoutes[userData.role_name || ''] || '/';
    sessionStorage.setItem('lastPath', defaultPath);
    localStorage.setItem('lastPath', defaultPath);
  };

  const logout = () => {
    setUser(null);
    
    // Clear both sessionStorage and localStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lastPath');
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastPath');
  };

  const getToken = () => {
    // Check sessionStorage first (tab-specific), then localStorage
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  };

  const getUserRole = () => {
    return user?.role_name || null;
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #e5e7eb',
            borderTop: '5px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getToken,
        getUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
