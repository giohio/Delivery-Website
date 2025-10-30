import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle, Clock, CreditCard, Plus, Search as SearchIcon, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

interface Order {
  id: string;
  date: string;
  from: string;
  to: string;
  items: string;
  price: number;
  status: 'completed' | 'pending' | 'waiting';
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notifications = [
    { id: 1, title: 'Đơn hàng đang giao', message: 'Đơn #FD2024001235 sắp đến nơi', time: '5 phút trước', unread: true },
    { id: 2, title: 'Ưu đãi mới', message: 'Giảm 20% cho đơn hàng tiếp theo', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Giao hàng thành công', message: 'Đơn #FD2024001234 đã hoàn thành', time: '2 giờ trước', unread: false },
  ];
  const [stats] = useState<OrderStats>({
    totalOrders: 3,
    completedOrders: 1,
    pendingOrders: 2,
    totalSpent: 65000
  });

  const [orders] = useState<Order[]>([
    {
      id: 'FD2024001234',
      date: '15/1/2024',
      from: 'Shop ABC - 123 Nguyễn Huệ, Q1',
      to: '456 Lê Lợi, Q3, TP.HCM',
      items: 'Quần áo thời trang (2 món)',
      price: 25000,
      status: 'completed'
    },
    {
      id: 'FD2024001235',
      date: '16/1/2024',
      from: 'Nhà hàng XYZ - 789 Trần Hưng Đạo, Q1',
      to: '321 Võ Văn Tần, Q3, TP.HCM',
      items: 'Đồ ăn nhanh',
      price: 18000,
      status: 'pending'
    },
    {
      id: 'FD2024001236',
      date: '16/1/2024',
      from: 'Siêu thị DEF - 555 Hai Bà Trưng, Q1',
      to: '789 Cách Mạng Tháng 8, Q10, TP.HCM',
      items: 'Thực phẩm tươi sống',
      price: 22000,
      status: 'waiting'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã giao';
      case 'pending': return 'Đang giao';
      case 'waiting': return 'Chờ xử lý';
      default: return status;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Khách hàng</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-6 h-6" />
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
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-6 h-6" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
                    </div>
                    <button 
                      onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Hồ sơ cá nhân
                    </button>
                    <button 
                      onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.fullName || 'User'}!
          </h2>
          <p className="text-gray-600">Quản lý đơn hàng và theo dõi giao hàng của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCreateOrderModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="font-medium">Tạo đơn hàng mới</span>
            </button>
            
            <button 
              onClick={() => document.getElementById('order-search')?.focus()}
              className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <SearchIcon className="w-8 h-8" />
              <span className="font-medium">Tra cứu đơn hàng</span>
            </button>
            
            <button 
              onClick={() => setShowProfileModal(true)}
              className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <User className="w-8 h-8" />
              <span className="font-medium">Cập nhật hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Đơn hàng của bạn</h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="order-search"
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="completed">Đã giao</option>
                  <option value="pending">Đang giao</option>
                  <option value="waiting">Chờ xử lý</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">#{order.id}</span>
                      </div>
                      <span className="text-sm text-gray-500">{order.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Từ:</span> {order.from}
                      </div>
                      <div>
                        <span className="font-medium">Đến:</span> {order.to}
                      </div>
                      <div>
                        <span className="font-medium">Hàng hóa:</span> {order.items}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {order.price.toLocaleString()} VND
                    </div>
                    <div className="space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Chi tiết
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowTrackingModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Theo dõi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Tạo đơn hàng mới</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ lấy hàng</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Nhập địa chỉ lấy hàng" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Nhập địa chỉ giao hàng" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả hàng hóa</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Mô tả hàng hóa"></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowCreateOrderModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{selectedOrder.id}</h3>
            <div className="space-y-3">
              <div><strong>Ngày tạo:</strong> {selectedOrder.date}</div>
              <div><strong>Từ:</strong> {selectedOrder.from}</div>
              <div><strong>Đến:</strong> {selectedOrder.to}</div>
              <div><strong>Hàng hóa:</strong> {selectedOrder.items}</div>
              <div><strong>Giá:</strong> {selectedOrder.price.toLocaleString()} VND</div>
              <div><strong>Trạng thái:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></div>
            </div>
            <button onClick={() => setShowOrderDetailModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đóng</button>
          </div>
        </div>
      )}

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cập nhật hồ sơ</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên</label>
                <input type="text" defaultValue={user?.fullName} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" defaultValue={user?.email} className="w-full border rounded px-3 py-2" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input type="tel" className="w-full border rounded px-3 py-2" placeholder="Nhập số điện thoại" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Theo dõi đơn hàng #{selectedOrder.id}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium">Đã tạo đơn</p>
                  <p className="text-sm text-gray-500">{selectedOrder.date}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium">Đang xử lý</p>
                  <p className="text-sm text-gray-500">Đang tìm tài xế phù hợp</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-400">Chờ lấy hàng</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTrackingModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đóng</button>
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
                  <span className="text-sm font-medium">Thông báo đơn hàng</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Nhận khuyến mãi</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Lưu địa chỉ thường dùng</span>
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
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán mặc định</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Tiền mặt</option>
                  <option>Thẻ ngân hàng</option>
                  <option>Ví điện tử</option>
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

export default CustomerDashboard;
