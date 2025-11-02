import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle, Clock, CreditCard, Plus, Search as SearchIcon, User, LogOut, Settings, Bell, Star, MapPin, Truck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateOrderModal } from '../customer/CreateOrderModal';
import { PaymentModal } from '../customer/PaymentModal';
import { RatingModal } from '../customer/RatingModal';
import { orderApi } from '../../services/orderApi';
import { notificationApi } from '../../services/notificationApi';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

interface Order {
  order_id: number;
  created_at: string;
  pickup_address: string;
  delivery_address: string;
  price_estimate: number;
  status: string;
  delivery_id?: number;
}

interface Notification {
  notification_id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [selectedDeliveryForRating, setSelectedDeliveryForRating] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate stats from orders
  const stats: OrderStats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    totalSpent: orders.reduce((sum, o) => Number(sum) + Number(o.price_estimate || 0), 0)
  };

  // Load data from database
  useEffect(() => {
    loadOrders();
    loadNotifications();
    
    // Auto refresh every 30 seconds to see status updates
    const interval = setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading orders...');
      const response = await orderApi.getMyOrders();
      console.log('Orders loaded:', response.orders);
      
      // Debug: Log each order's status and expected buttons
      if (response.orders) {
        response.orders.forEach((order: any) => {
          const status = order.status?.toUpperCase();
          console.log(`Order #FD${order.order_id.toString().padStart(2, '0')}:`, {
            status: status,
            shouldShowTrack: status === 'ASSIGNED' || status === 'ONGOING',
            shouldShowPay: status === 'PENDING',
            shouldShowRate: status === 'COMPLETED' && order.delivery_id
          });
        });
      }
      
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_id.toString().includes(searchTerm.toLowerCase()) ||
                         order.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-purple-100 text-purple-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'Đã giao';
      case 'PENDING': return 'Chờ xử lý';
      case 'ASSIGNED': return 'Đang giao';
      case 'ONGOING': return 'Đang giao';
      case 'CANCELED': return 'Đã hủy';
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
                  {notifications.filter(n => !n.is_read).length > 0 && (
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
                        <div key={notif.notification_id} className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                          onClick={async () => {
                            try {
                              await notificationApi.markAsRead(notif.notification_id);
                              loadNotifications();
                            } catch (err) {
                              console.error('Failed to mark as read:', err);
                            }
                          }}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            {!notif.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                          </div>
                          <p className="text-sm text-gray-600">{notif.body}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('vi-VN')}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSpent.toLocaleString('vi-VN')} ₫
                </p>
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
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => {
                    console.log('Refreshing orders...');
                    loadOrders();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh orders"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
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
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                console.log(`Order #FD${order.order_id.toString().padStart(2, '0')} status:`, order.status);
                return (
              <div key={order.order_id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">#FD{order.order_id.toString().padStart(2, '0')}</span> {/* Updated format */}
                      </div>
                      <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">From:</span> {order.pickup_address}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {order.delivery_address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {Number(order.price_estimate || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="space-x-2 flex flex-wrap gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Details
                      </button>
                      
                      {/* Track button for ASSIGNED and ONGOING orders */}
                      {(order.status?.toUpperCase() === 'ASSIGNED' || order.status?.toUpperCase() === 'ONGOING') && (
                        <button 
                          onClick={() => {
                            setSelectedOrderForTracking(order);
                            setShowTrackingModal(true);
                          }}
                          className="px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Track</span>
                        </button>
                      )}
                      
                      {/* Pay and Cancel buttons for PENDING orders */}
                      {order.status?.toUpperCase() === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedOrderForPayment(order);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                          
                          <button 
                            onClick={async () => {
                              if (confirm('Are you sure you want to cancel this order?')) {
                                try {
                                  await orderApi.cancelOrder(order.order_id);
                                  loadOrders();
                                  alert('Order cancelled successfully');
                                } catch (err: any) {
                                  alert(err.response?.data?.error || 'Failed to cancel order');
                                }
                              }
                            }}
                            className="px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {/* Rate button for COMPLETED orders */}
                      {order.status?.toUpperCase() === 'COMPLETED' && order.delivery_id && (
                        <button 
                          onClick={() => {
                            setSelectedDeliveryForRating(order.delivery_id!.toString());
                            setShowRatingModal(true);
                          }}
                          className="px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          <Star className="w-3 h-3" />
                          <span>Rate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateOrderModal && (
        <CreateOrderModal
          onClose={() => setShowCreateOrderModal(false)}
          onSuccess={() => {
            loadOrders();
            setShowCreateOrderModal(false);
            alert('Order created successfully!');
          }}
        />
      )}

      {showPaymentModal && selectedOrderForPayment && (
        <PaymentModal
          orderId={selectedOrderForPayment.order_id} 
          amount={selectedOrderForPayment.price_estimate || 0}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
          onSuccess={() => {
            loadOrders();
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
            alert('Payment processed successfully!');
          }}
        />
      )}

      {showRatingModal && selectedDeliveryForRating && (
        <RatingModal
          deliveryId={parseInt(selectedDeliveryForRating)}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDeliveryForRating(null);
          }}
          onSuccess={() => {
            alert('Thank you for your feedback!');
            setShowRatingModal(false);
            setSelectedDeliveryForRating(null);
          }}
        />
      )}

      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Order Details #FD{selectedOrder.order_id.toString().padStart(2, '0')}</h3> {/* Updated format */}
            <div className="space-y-3">
              <div><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</div>
              <div><strong>From:</strong> {selectedOrder.pickup_address}</div>
              <div><strong>To:</strong> {selectedOrder.delivery_address}</div>
              <div><strong>Price:</strong> {Number(selectedOrder.price_estimate || 0).toLocaleString('vi-VN')} ₫</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></div>
            </div>
            <button onClick={() => setShowOrderDetailModal(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Profile</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              setShowProfileModal(false);
              alert('Profile updated!');
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
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Close</button>
              <button onClick={() => { alert('Settings saved!'); setShowSettings(false); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {showTrackingModal && selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Track Order #FD{selectedOrderForTracking.order_id.toString().padStart(2, '0')}</h3> {/* Updated format */}
              <button 
                onClick={() => {
                  setShowTrackingModal(false);
                  setSelectedOrderForTracking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Order Status */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedOrderForTracking.status === 'ASSIGNED' ? 'Driver Assigned' : 'Out for Delivery'}
                    </p>
                    <p className="text-sm text-gray-600">Your order is on the way</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estimated Time</p>
                  <p className="font-bold text-blue-600">15-30 mins</p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-gray-900">{selectedOrderForTracking.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-gray-900">{selectedOrderForTracking.delivery_address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Order Value</p>
                <p className="text-lg font-bold text-gray-900">
                  {Number(selectedOrderForTracking.price_estimate || 0).toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Delivery Progress
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Order Confirmed</p>
                      <span className="text-sm text-gray-600">{new Date(selectedOrderForTracking.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <p className="text-sm text-gray-600">Your order has been confirmed and is being prepared</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 border-l-2 border-gray-200 ml-3 pl-7">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 -ml-7">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Driver Assigned</p>
                      <span className="text-sm text-gray-600">
                        {new Date(new Date(selectedOrderForTracking.created_at).getTime() + 10*60000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Driver is on the way to pickup location</p>
                  </div>
                </div>

                {selectedOrderForTracking.status === 'ONGOING' && (
                  <div className="flex items-start space-x-4 border-l-2 border-gray-200 ml-3 pl-7">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 -ml-7">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">Out for Delivery</p>
                        <span className="text-sm text-gray-600">
                          {new Date(new Date(selectedOrderForTracking.created_at).getTime() + 20*60000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Package is on the way to delivery address</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4 border-l-2 border-gray-200 ml-3 pl-7">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 -ml-7">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-400">Delivered</p>
                      <span className="text-sm text-gray-400">Pending</span>
                    </div>
                    <p className="text-sm text-gray-400">Package will be delivered soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Contact */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Driver Information
              </h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">Driver Name</p>
                  <p className="text-sm text-gray-600">Honda Wave - 29A1-12345</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <span>📞</span>
                  <span>Call Driver</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  setShowTrackingModal(false);
                  setSelectedOrderForTracking(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
