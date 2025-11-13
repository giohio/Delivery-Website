import { useState, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Package,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../services/notificationApi';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'customer' | 'courier' | 'merchant' | 'admin';
  menuItems: MenuItem[];
}

interface MenuItem {
  path: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

// Role-based color themes
const themes = {
  customer: {
    primary: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    hover: 'hover:bg-teal-100',
    active: 'bg-teal-100 text-teal-700',
  },
  courier: {
    primary: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-100',
    active: 'bg-orange-100 text-orange-700',
  },
  merchant: {
    primary: 'from-blue-700 to-indigo-800',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-100',
    active: 'bg-blue-100 text-blue-800',
  },
  admin: {
    primary: 'from-purple-600 to-pink-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-100',
    active: 'bg-purple-100 text-purple-700',
  },
};

export default function DashboardLayout({ children, role, menuItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = themes[role];

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();
      if (response.ok) {
        setNotifications(response.notifications);
        setNotificationCount(response.notifications.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.bg} border-r border-gray-200 flex flex-col shadow-lg`}
          >
            {/* Logo */}
            <div className={`h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r ${theme.primary}`}>
              <Link to={`/${role}/dashboard`} className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-white" />
                <span className="text-xl font-bold text-white">DeliveryHub</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? theme.active
                      : `text-gray-700 ${theme.hover}`
                  }`}
                >
                  <span className="w-5 h-5">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-bold`}>
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, users..."
                className="bg-transparent border-none focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  loadNotifications();
                }}
                className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif.notification_id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notif.is_read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notif.notification_id)}
                        >
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.body}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-bold text-sm`}>
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <Link
                    to={`/${role}/profile`}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to={`/${role}/settings`}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-red-600 border-t border-gray-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
