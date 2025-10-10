import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMember } from '@/integrations';
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
  PieChart,
  Activity,
  Settings,
  Bell,
  Shield,
  Database,
  Globe,
  Zap,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for admin dashboard
const systemStats = {
  totalUsers: 15420,
  activeDrivers: 1250,
  activeMerchants: 890,
  totalOrders: 45680,
  completedOrders: 42150,
  pendingOrders: 2180,
  cancelledOrders: 1350,
  totalRevenue: 125000000,
  systemUptime: 99.8,
  averageDeliveryTime: 28,
  customerSatisfaction: 4.7
};

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

const mockUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    role: 'driver',
    status: 'active',
    joinDate: '2024-01-15',
    totalOrders: 156,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Shop Fashion ABC',
    email: 'shop@abc.com',
    role: 'merchant',
    status: 'active',
    joinDate: '2024-01-10',
    totalOrders: 89,
    rating: 4.6
  },
  {
    id: 3,
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    role: 'customer',
    status: 'active',
    joinDate: '2024-01-20',
    totalOrders: 23,
    rating: 4.9
  },
  {
    id: 4,
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    role: 'driver',
    status: 'suspended',
    joinDate: '2024-01-05',
    totalOrders: 45,
    rating: 3.2
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'driver':
      return 'bg-blue-100 text-blue-800';
    case 'merchant':
      return 'bg-green-100 text-green-800';
    case 'customer':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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
  const { member } = useMember();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
                <AvatarImage src={member?.profile?.photo?.url} />
                <AvatarFallback className="bg-red-100 text-red-700">
                  {member?.profile?.nickname?.charAt(0) || member?.contact?.firstName?.charAt(0) || 'A'}
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
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-light-grey">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'customer' ? 'Khách hàng' :
                           user.role === 'driver' ? 'Tài xế' :
                           user.role === 'merchant' ? 'Merchant' : 'Admin'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'active' ? 'Hoạt động' :
                           user.status === 'suspended' ? 'Tạm khóa' : 'Chờ duyệt'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-grey">
                        {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.rating}/5
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-green-600">
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