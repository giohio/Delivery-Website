import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminApiService } from '@/services/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Truck,
  Store,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Settings,
  Bell,
  Shield,
  Zap,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Plus,
  Search,
  LogOut,
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui';

interface SystemStats {
  totalUsers: number;
  activeDrivers: number;
  activeMerchants: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  systemUptime: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

const recentActivities = [
  {
    id: 1,
    type: 'order',
    message: 'Đơn hàng #FD2024001234 đã được hoàn thành',
    timestamp: '2 phút trước',
    status: 'success'
  },
  {
    id: 2,
    type: 'user',
    message: 'Tài xế mới Nguyễn Văn A đã đăng ký',
    timestamp: '5 phút trước',
    status: 'info'
  },
  {
    id: 3,
    type: 'alert',
    message: 'Cảnh báo: Thời gian giao hàng trung bình tăng 15%',
    timestamp: '10 phút trước',
    status: 'warning'
  },
  {
    id: 4,
    type: 'merchant',
    message: 'Merchant Shop ABC đã nâng cấp gói Premium',
    timestamp: '15 phút trước',
    status: 'success'
  }
];

interface UserData {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  totalOrders?: number;
  rating?: number;
}

const getRoleColor = (role: string) => {
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'driver':
    case 'shipper':
      return 'bg-blue-100 text-blue-800';
    case 'merchant':
      return 'bg-green-100 text-green-800';
    case 'customer':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleLabel = (role: string) => {
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'admin':
      return 'Admin';
    case 'driver':
    case 'shipper':
      return 'Tài xế';
    case 'merchant':
      return 'Merchant';
    case 'customer':
      return 'Khách hàng';
    default:
      return role;
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

const getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Hoạt động' : 'Tạm khóa';
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'order':
      return Package;
    case 'user':
      return Users;
    case 'alert':
      return AlertTriangle;
    case 'merchant':
      return Store;
    default:
      return Activity;
  }
};

const getActivityColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notifications = [
    { id: 1, title: 'Cảnh báo hệ thống', message: 'CPU sử dụng đang cao: 85%', time: '2 phút trước', unread: true },
    { id: 2, title: 'Người dùng mới', message: '5 tài xế mới đăng ký hôm nay', time: '10 phút trước', unread: true },
    { id: 3, title: 'Báo cáo doanh thu', message: 'Báo cáo tháng 10 đã sẵn sàng', time: '1 giờ trước', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeDrivers: 0,
    activeMerchants: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    systemUptime: 99.8,
    averageDeliveryTime: 28,
    customerSatisfaction: 4.7
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admin dashboard data...');
      
      const [summaryData, usersData] = await Promise.all([
        adminApiService.getSummary(),
        adminApiService.getUsers()
      ]);
      
      console.log('✅ Received users from API:', usersData);
      console.log('✅ Received summary from API:', summaryData);
      
      setUsers(usersData);
      
      // Calculate stats from summary
      const drivers = usersData.filter(u => u.role_name.toLowerCase() === 'driver' || u.role_name.toLowerCase() === 'shipper');
      const merchants = usersData.filter(u => u.role_name.toLowerCase() === 'merchant');
      
      const calculatedStats = {
        totalUsers: summaryData.total_users || usersData.length,
        activeDrivers: drivers.filter(d => d.is_active).length,
        activeMerchants: merchants.filter(m => m.is_active).length,
        totalOrders: summaryData.total_orders || 0,
        completedOrders: summaryData.total_deliveries || 0,
        pendingOrders: (summaryData.total_orders || 0) - (summaryData.total_deliveries || 0),
        cancelledOrders: 0,
        totalRevenue: summaryData.revenue || 0,
        systemUptime: 99.8,
        averageDeliveryTime: 28,
        customerSatisfaction: 4.7
      };
      
      console.log('📊 Calculated stats:', calculatedStats);
      setSystemStats(calculatedStats);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role_name.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'suspended' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light-grey">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-heading font-bold text-primary">FastDelivery Admin</h1>
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-light-grey">System Online</span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-blue-50' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            {notif.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                          </div>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              {/* Avatar with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-medium hover:bg-red-200 transition-colors"
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
            Admin Dashboard
          </h2>
          <p className="text-light-grey">
            Monitor and manage the entire FastDelivery system
          </p>
        </motion.div>

        {/* System Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Revenue</p>
                <p className="text-2xl font-bold text-foreground">{(systemStats.totalRevenue / 1000000).toFixed(0)}M</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">System Uptime</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.systemUptime}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Active Drivers</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.activeDrivers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Active Merchants</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.activeMerchants}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.averageDeliveryTime}m</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-light-grey">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-foreground">{systemStats.customerSatisfaction}/5</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Recent Activities
              </h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.status);
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-light-grey">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Order Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Orders Overview
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{systemStats.completedOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Completed</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{systemStats.pendingOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Processing</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{systemStats.cancelledOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Cancelled</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {((systemStats.completedOrders / systemStats.totalOrders) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-light-grey">Success Rate</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                User Management
              </h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-grey" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="shipper">Driver</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.user_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-foreground">{user.full_name}</div>
                            <div className="text-sm text-light-grey">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(user.role_name)}>
                          {getRoleLabel(user.role_name)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(user.is_active)}>
                          {getStatusLabel(user.is_active)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-grey">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.totalOrders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.rating ? `${user.rating}/5` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.is_active ? (
                            <Button variant="ghost" size="sm" className="text-red-600" title="Khóa tài khoản">
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-green-600" title="Kích hoạt tài khoản">
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-light-grey mx-auto mb-4" />
                <p className="text-light-grey">No users found</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Auto Maintenance</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Email Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">High Security Mode</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Backup Time (hours)</label>
                <input type="time" defaultValue="02:00" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Log Level</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Error</option>
                  <option>Debug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                <input type="number" defaultValue="30" className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Close</button>
              <button onClick={() => { alert('System settings saved!'); setShowSettings(false); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}