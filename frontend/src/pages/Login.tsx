import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithFacebook } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await signInWithGoogle();
      const roleId = userData.role_id || 4;
      login(userData);
      redirectToRoleDashboard(roleId);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await signInWithFacebook();
      const roleId = userData.role_id || 4;
      login(userData);
      redirectToRoleDashboard(roleId);
    } catch (err: any) {
      setError(err.message || 'Facebook login failed');
      console.error('Facebook login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';

  // Helper function to map role_id to role_name
  const getRoleName = async (roleId: number): Promise<string> => {
    const roleMap: { [key: number]: string } = {
      1: 'admin',
      2: 'merchant',
      3: 'shipper',
      4: 'customer'
    };
    return roleMap[roleId] || 'customer';
  };

  // Helper function to redirect based on role ID
  const redirectToRoleDashboard = (roleId: number) => {
    const roleRedirects: { [key: number]: string } = {
      1: '/admin/dashboard',
      2: '/merchant/dashboard',
      3: '/shipper/dashboard',
      4: '/customer/dashboard',
    };
    const path = roleRedirects[roleId] || '/customer/dashboard';
    console.log(`Redirecting to ${path} for role_id ${roleId}`);
    navigate(path);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
      const backendUser = data.user;
      const currentRoleId = backendUser?.current_role_id || backendUser?.role_id || 4;
      const displayName = backendUser?.username || backendUser?.full_name || (formData.email.split('@')[0]);
      const roleName = await getRoleName(backendUser?.role_id || 4);
      
      const userData = {
        email: backendUser?.email || formData.email,
        fullName: displayName,
        role_id: backendUser?.role_id,
        role_name: roleName,
        user_id: backendUser?.user_id
      };
      
      login(userData, data.token);
      redirectToRoleDashboard(currentRoleId);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">FastDelivery</h1>
          <p className="text-gray-600">Fast Delivery Service</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me, Sign up & Forgot Password */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <div className="flex items-center justify-between text-sm">
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign Up
                </Link>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Login with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium text-sm">Google</span>
            </button>

            {/* Facebook Login */}
            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Login with Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="font-medium text-sm">Facebook</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Chính sách bảo mật
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
