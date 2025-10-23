import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApiService } from '@/services/adminApi';
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
  Search
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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
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
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, usersData] = await Promise.all([
        adminApiService.getSummary(),
        adminApiService.getUsers()
      ]);
      
      setUsers(usersData);
      
      // Calculate stats from summary
      const drivers = usersData.filter(u => u.role_name.toLowerCase() === 'driver' || u.role_name.toLowerCase() === 'shipper');
      const merchants = usersData.filter(u => u.role_name.toLowerCase() === 'merchant');
      
      setSystemStats({
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
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
          <p className="text-light-grey">Đang tải dữ liệu...</p>
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
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-red-100 text-red-700">
                  A
                </AvatarFallback>
              </Avatar>
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
            Bảng điều khiển quản trị
          </h2>
          <p className="text-light-grey">
            Giám sát và quản lý toàn bộ hệ thống FastDelivery
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
                <p className="text-sm text-light-grey">Tổng người dùng</p>
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
                <p className="text-sm text-light-grey">Tổng đơn hàng</p>
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
                <p className="text-sm text-light-grey">Doanh thu</p>
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
                <p className="text-sm text-light-grey">Uptime hệ thống</p>
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
                <p className="text-sm text-light-grey">Tài xế hoạt động</p>
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
                <p className="text-sm text-light-grey">Merchant hoạt động</p>
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
                <p className="text-sm text-light-grey">Thời gian giao TB</p>
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
                <p className="text-sm text-light-grey">Hài lòng KH</p>
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
                Hoạt động gần đây
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
                Tổng quan đơn hàng
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{systemStats.completedOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Hoàn thành</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{systemStats.pendingOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Đang xử lý</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{systemStats.cancelledOrders.toLocaleString()}</p>
                  <p className="text-sm text-light-grey">Đã hủy</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {((systemStats.completedOrders / systemStats.totalOrders) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-light-grey">Tỷ lệ thành công</p>
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
                Quản lý người dùng
              </h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-grey" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
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
                  <option value="all">Tất cả vai trò</option>
                  <option value="customer">Khách hàng</option>
                  <option value="driver">Tài xế</option>
                  <option value="shipper">Tài xế</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Tạm khóa</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm người dùng
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light-grey uppercase tracking-wider">
                      Thao tác
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
                <p className="text-light-grey">Không tìm thấy người dùng nào</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}