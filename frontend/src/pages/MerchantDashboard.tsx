import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Truck, Star, Users, TrendingUp, Plus, Upload, BarChart3, Download, Search, Eye, Edit, Trash2, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
  };
  products: string;
  total: string;
  shippingFee: string;
  status: 'delivered' | 'shipping' | 'pending';
  driver: string;
}

const MerchantDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notifications = [
    { id: 1, title: 'Đơn hàng mới', message: 'Bạn có 3 đơn hàng mới cần xử lý', time: '5 phút trước', unread: true },
    { id: 2, title: 'Giao hàng thành công', message: 'Đơn #FD2024001234 đã được giao', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Cập nhật hệ thống', message: 'Phiên bản mới đã có sẵn', time: '2 giờ trước', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data
  const stats = {
    totalOrders: 156,
    completed: 142,
    revenue: '12.5M',
    shippingFees: '3.2M',
    averageRating: 4.7,
    returningCustomers: 89
  };

  const orders: Order[] = [
    {
      id: '#FD2024001234',
      date: '15/1/2024',
      customer: {
        name: 'Nguyễn Văn A',
        phone: '0901234567'
      },
      products: 'Áo thun nam x2, Quần jean x1',
      total: '450,000 VNĐ',
      shippingFee: '25,000 VNĐ',
      status: 'delivered',
      driver: 'Trần Văn B'
    },
    {
      id: '#FD2024001235',
      date: '15/1/2024',
      customer: {
        name: 'Lê Thị C',
        phone: '0912345678'
      },
      products: 'Váy dạ hội x1',
      total: '800,000 VNĐ',
      shippingFee: '30,000 VNĐ',
      status: 'shipping',
      driver: 'Phạm Văn D'
    },
    {
      id: '#FD2024001236',
      date: '16/1/2024',
      customer: {
        name: 'Hoàng Văn E',
        phone: '0923456789'
      },
      products: 'Giày thể thao x1, Tất thể thao x3',
      total: '635,000 VNĐ',
      shippingFee: '22,000 VNĐ',
      status: 'pending',
      driver: 'Chưa phân công'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao' },
      shipping: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang giao' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleCreateOrder = () => {
    setShowCreateOrderModal(true);
  };

  const handleBulkUpload = () => {
    setShowBulkUploadModal(true);
  };

  const handleViewReport = () => {
    // Generate a simple report
    const reportData = `Báo cáo kinh doanh\n\nTổng đơn: ${stats.totalOrders}\nHoàn thành: ${stats.completed}\nDoanh thu: ${stats.revenue}\nPhí vận chuyển: ${stats.shippingFees}`;
    alert(reportData);
  };

  const handleExportData = () => {
    // Export to CSV
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Đơn hàng,Ngày,Khách hàng,Sản phẩm,Giá trị,Trạng thái\n' +
      orders.map(o => `${o.id},${o.date},${o.customer.name},${o.products},${o.total},${o.status}`).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'orders_export.csv');
    link.click();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Bạn có chắc muốn xóa đơn hàng ${orderId}?`)) {
      alert(`Đã xóa đơn hàng ${orderId}. Trong ứng dụng thực tế sẽ gọi API để xóa.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium border border-purple-200">
                Merchant
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Thông báo</h3>
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
                      <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Avatar with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'SK'}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Merchant'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'merchant@example.com'}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Hồ sơ cá nhân
                    </button>
                    <button 
                      onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Cài đặt
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng, Soul Knight!</h2>
          <p className="text-gray-600">Quản lý đơn hàng và theo dõi hiệu suất kinh doanh của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
            <p className="text-3xl font-bold text-gray-900">{stats.revenue}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Truck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Phí giao hàng</p>
            <p className="text-3xl font-bold text-gray-900">{stats.shippingFees}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Đánh giá TB</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">KH quay lại</p>
            <p className="text-3xl font-bold text-gray-900">{stats.returningCustomers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleCreateOrder}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Tạo đơn hàng
            </button>
            <button
              onClick={handleBulkUpload}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Upload className="w-5 h-5 text-blue-600" />
              Upload hàng loạt
            </button>
            <button
              onClick={handleViewReport}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Báo cáo chi tiết
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-5 h-5 text-blue-600" />
              Xuất dữ liệu
            </button>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="delivered">Đã giao</option>
                <option value="shipping">Đang giao</option>
                <option value="pending">Chờ xử lý</option>
              </select>

              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài xế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.products}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.total}</div>
                      <div className="text-sm text-gray-500">Phí GH: {order.shippingFee}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.driver}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Tạo đơn hàng mới</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Tạo đơn thành công!'); setShowCreateOrderModal(false); }}>
              <div>
                <label className="block text-sm font-medium mb-1">Tên khách hàng</label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Nhập tên khách hàng" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SĐT khách hàng</label>
                <input type="tel" required className="w-full border rounded px-3 py-2" placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng</label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Nhập địa chỉ" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm</label>
                <textarea required className="w-full border rounded px-3 py-2" rows={3} placeholder="Mô tả sản phẩm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá trị đơn hàng (VND)</label>
                <input type="number" required className="w-full border rounded px-3 py-2" placeholder="Nhập giá trị" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowCreateOrderModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Upload hàng loạt</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Kéo thả file CSV hoặc click để chọn</p>
                <input type="file" accept=".csv,.xlsx" className="hidden" id="bulk-upload" />
                <label htmlFor="bulk-upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Chọn file
                </label>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Hướng dẫn:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File phải định dạng CSV hoặc Excel</li>
                  <li>Cột: Tên, SĐT, Địa chỉ, Sản phẩm, Giá</li>
                </ul>
              </div>
              <button onClick={() => setShowBulkUploadModal(false)} className="w-full px-4 py-2 border rounded hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng {selectedOrder.id}</h3>
            <div className="space-y-3">
              <div><strong>Ngày:</strong> {selectedOrder.date}</div>
              <div><strong>Khách hàng:</strong> {selectedOrder.customer.name} - {selectedOrder.customer.phone}</div>
              <div><strong>Sản phẩm:</strong> {selectedOrder.products}</div>
              <div><strong>Giá trị:</strong> {selectedOrder.total}</div>
              <div><strong>Phí giao hàng:</strong> {selectedOrder.shippingFee}</div>
              <div><strong>Tài xế:</strong> {selectedOrder.driver}</div>
              <div><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</div>
            </div>
            <button onClick={() => setShowOrderDetailModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đóng</button>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa đơn hàng {selectedOrder.id}</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Cập nhật thành công!'); setShowEditModal(false); }}>
              <div>
                <label className="block text-sm font-medium mb-1">Tên khách hàng</label>
                <input type="text" defaultValue={selectedOrder.customer.name} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SĐT</label>
                <input type="tel" defaultValue={selectedOrder.customer.phone} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm</label>
                <textarea defaultValue={selectedOrder.products} className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cài đặt</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Thông báo Email</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Thông báo Push</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Hiển thị đơn hàng mới tự động</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Múi giờ</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>GMT+7 (Việt Nam)</option>
                  <option>GMT+8 (Singapore)</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Đóng</button>
              <button onClick={() => { alert('Đã lưu cài đặt!'); setShowSettings(false); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboard;
