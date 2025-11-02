import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Truck, Star, Users, Plus, Upload, BarChart3, Download, Search, Eye, Edit, Trash2, LogOut, User } from 'lucide-react';
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
    { id: 1, title: 'New orders', message: 'You have 3 new orders to process', time: '5 minutes ago', unread: true },
    { id: 2, title: 'Delivery completed', message: 'Order #FD2024001234 has been delivered', time: '1 hour ago', unread: true },
    { id: 3, title: 'System update', message: 'New version available', time: '2 hours ago', unread: false },
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
                      Profile
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
                      Logout
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.fullName || 'Merchant'}! 👋</h2>
          <p className="text-gray-600">Manage your orders and track business performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
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
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{stats.revenue}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Truck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Shipping Fees</p>
            <p className="text-3xl font-bold text-gray-900">{stats.shippingFees}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Returning Customers</p>
            <p className="text-3xl font-bold text-gray-900">{stats.returningCustomers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleCreateOrder}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Order
            </button>
            <button
              onClick={handleBulkUpload}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Upload className="w-5 h-5 text-blue-600" />
              Bulk Upload
            </button>
            <button
              onClick={handleViewReport}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <BarChart3 className="w-5 h-5 text-blue-600" />
              View Reports
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-5 h-5 text-blue-600" />
              Export Data
            </button>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Orders Management</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="shipping">Shipping</option>
                <option value="pending">Pending</option>
              </select>

              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      <div className="text-sm text-gray-500">Shipping: {order.shippingFee}</div>
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
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
            <h3 className="text-xl font-bold mb-4">Create New Order</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Order created successfully!'); setShowCreateOrderModal(false); }}>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Enter customer name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Phone</label>
                <input type="tel" required className="w-full border rounded px-3 py-2" placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Address</label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Products</label>
                <textarea required className="w-full border rounded px-3 py-2" rows={3} placeholder="Product description"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order Value (VND)</label>
                <input type="number" required className="w-full border rounded px-3 py-2" placeholder="Enter value" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowCreateOrderModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Bulk Upload</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Drag & drop CSV file or click to select</p>
                <input type="file" accept=".csv,.xlsx" className="hidden" id="bulk-upload" />
                <label htmlFor="bulk-upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Choose File
                </label>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File must be in CSV or Excel format</li>
                  <li>Columns: Name, Phone, Address, Products, Price</li>
                </ul>
              </div>
              <button onClick={() => setShowBulkUploadModal(false)} className="w-full px-4 py-2 border rounded hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Order Details {selectedOrder.id}</h3>
            <div className="space-y-3">
              <div><strong>Date:</strong> {selectedOrder.date}</div>
              <div><strong>Customer:</strong> {selectedOrder.customer.name} - {selectedOrder.customer.phone}</div>
              <div><strong>Products:</strong> {selectedOrder.products}</div>
              <div><strong>Total:</strong> {selectedOrder.total}</div>
              <div><strong>Shipping Fee:</strong> {selectedOrder.shippingFee}</div>
              <div><strong>Driver:</strong> {selectedOrder.driver}</div>
              <div><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</div>
            </div>
            <button onClick={() => setShowOrderDetailModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Order {selectedOrder.id}</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Updated successfully!'); setShowEditModal(false); }}>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input type="text" defaultValue={selectedOrder.customer.name} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" defaultValue={selectedOrder.customer.phone} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Products</label>
                <textarea defaultValue={selectedOrder.products} className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Push Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Auto Show New Orders</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>English</option>
                  <option>Vietnamese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>GMT+7 (Vietnam)</option>
                  <option>GMT+8 (Singapore)</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Close</button>
              <button onClick={() => { alert('Settings saved!'); setShowSettings(false); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboard;
