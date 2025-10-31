import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle, Clock, CreditCard, Plus, Search as SearchIcon, User, LogOut, Settings, Bell, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CreateOrderModal } from '../components/customer/CreateOrderModal';
import { PaymentModal } from '../components/customer/PaymentModal';
import { RatingModal } from '../components/customer/RatingModal';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedDeliveryForRating, setSelectedDeliveryForRating] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notifications = [
    { id: 1, title: 'Order in transit', message: 'Order #FD2024001235 arriving soon', time: '5 minutes ago', unread: true },
    { id: 2, title: 'New promotion', message: '20% off your next order', time: '1 hour ago', unread: true },
    { id: 3, title: 'Delivery completed', message: 'Order #FD2024001234 completed', time: '2 hours ago', unread: false },
  ];
  const [stats] = useState<OrderStats>({
    totalOrders: 3,
    completedOrders: 1,
    pendingOrders: 2,
    totalSpent: 65000
  });

  const [orders, setOrders] = useState<Order[]>([
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
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Customer</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName || 'Customer'}!
          </h2>
          <p className="text-gray-600">Manage your orders and track deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCreateOrderModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="font-medium">Create New Order</span>
            </button>
            
            <button 
              onClick={() => document.getElementById('order-search')?.focus()}
              className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <SearchIcon className="w-8 h-8" />
              <span className="font-medium">Search Orders</span>
            </button>
            
            <button 
              onClick={() => setShowProfileModal(true)}
              className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <User className="w-8 h-8" />
              <span className="font-medium">Update Profile</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="order-search"
                    type="text"
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">In Transit</option>
                  <option value="waiting">Waiting Pickup</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No orders found</p>
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">From:</span> {order.from}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {order.to}
                      </div>
                      <div>
                        <span className="font-medium">Items:</span> {order.items}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {order.price.toLocaleString()} VND
                    </div>
                    <div className="space-x-2 flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Details
                      </button>
                      
                      {/* Pay Button - Show for all orders, disable if already paid */}
                      <button 
                        onClick={() => {
                          if (order.status !== 'completed') {
                            setSelectedOrderForPayment(order);
                            setShowPaymentModal(true);
                          }
                        }}
                        disabled={order.status === 'completed'}
                        className={`px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 ${
                          order.status === 'completed'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Pay</span>
                      </button>
                      
                      {/* Track Button - Show for all orders */}
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowTrackingModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Track
                      </button>
                      
                      {/* Rate Button - Show for all orders, disable if not completed */}
                      <button 
                        onClick={() => {
                          if (order.status === 'completed') {
                            setSelectedDeliveryForRating(order.id);
                            setShowRatingModal(true);
                          }
                        }}
                        disabled={order.status !== 'completed'}
                        className={`px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 ${
                          order.status !== 'completed'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        <span>Rate</span>
                      </button>
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
        <CreateOrderModal
          onClose={() => setShowCreateOrderModal(false)}
          onSuccess={(orderData) => {
            // Order created successfully via API
            // Add to local state for immediate display (with real backend data if available)
            if (orderData?.createdOrder) {
              // Use real order data from backend
              const backendOrder = orderData.createdOrder;
              const newOrder: Order = {
                id: `FD${backendOrder.order_id}`,
                date: new Date(backendOrder.created_at).toLocaleDateString('vi-VN'),
                from: backendOrder.pickup_address,
                to: backendOrder.delivery_address,
                items: `Distance: ${backendOrder.distance_km || 0} km`,
                price: backendOrder.price_estimate || 0,
                status: 'pending'
              };
              setOrders([newOrder, ...orders]);
              alert(`Order created successfully! Order #${backendOrder.order_id}`);
            } else {
              // Fallback to form data if backend response not available
              const newOrderId = `FD${orderData?.orderId || Date.now()}`;
              const newOrder: Order = {
                id: newOrderId,
                date: new Date().toLocaleDateString('vi-VN'),
                from: orderData?.pickup_address || 'Pickup location',
                to: orderData?.delivery_address || 'Delivery location',
                items: `Distance: ${orderData?.distance_km || 0} km`,
                price: orderData?.price_estimate || 0,
                status: 'pending'
              };
              setOrders([newOrder, ...orders]);
              alert(`Order created successfully! Order #${newOrderId}`);
            }
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrderForPayment && (
        <PaymentModal
          orderId={parseInt(selectedOrderForPayment.id.replace('FD', ''))} 
          amount={selectedOrderForPayment.price}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
          onSuccess={() => {
            alert('Payment processed successfully!');
          }}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedDeliveryForRating && (
        <RatingModal
          deliveryId={1} // Using demo delivery ID for mock data
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDeliveryForRating(null);
          }}
          onSuccess={() => {
            // Modal already shows success alert
            setShowRatingModal(false);
            setSelectedDeliveryForRating(null);
          }}
        />
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="space-y-3">
              <div><strong>Date:</strong> {selectedOrder.date}</div>
              <div><strong>From:</strong> {selectedOrder.from}</div>
              <div><strong>To:</strong> {selectedOrder.to}</div>
              <div><strong>Items:</strong> {selectedOrder.items}</div>
              <div><strong>Price:</strong> {selectedOrder.price.toLocaleString()} VND</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></div>
            </div>
            <button onClick={() => setShowOrderDetailModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Profile</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // TODO: Add API call to update profile
              setShowProfileModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" defaultValue={user?.fullName} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" defaultValue={user?.email} className="w-full border rounded px-3 py-2" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" defaultValue={user?.phone} className="w-full border rounded px-3 py-2" placeholder="Enter phone number" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Track Order</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium">Order Created</p>
                  <p className="text-sm text-gray-500">{selectedOrder.date}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium">In Transit</p>
                  <p className="text-sm text-gray-500">Order is being processed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                <div>
                  <p className="font-medium text-gray-400">Waiting Pickup</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTrackingModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
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
                  <span className="text-sm font-medium">Order Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Receive Promotions</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Save Frequent Addresses</span>
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
                <label className="block text-sm font-medium mb-2">Default Payment Method</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Cash</option>
                  <option>Credit/Debit Card</option>
                  <option>E-Wallet</option>
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

export default CustomerDashboard;
