import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Navigation, Star, Clock, MapPin, Bell, Settings, CheckCircle, Phone, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deliveryApi, Delivery } from '../services/deliveryApi';
import { walletApi } from '../services/walletApi';
import { Order, orderApi } from '../services/orderApi';

const ShipperDashboardModern: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    earnings: 0,
    distance: 0,
    avgRating: 0,
    onlineTime: '0h 0m'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Auto refresh only Available Orders every 30 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing available orders...');
      loadAvailableOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        loadAvailableOrders(),
        loadCurrentDelivery(),
        loadStats()
      ]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAvailableOrders = async (showLoading = false) => {
    try {
      if (showLoading) {
        setOrdersLoading(true);
      }
      
      const response = await deliveryApi.getAvailableOrders();
      console.log('Available orders response:', response);
      const newOrders = response.orders || [];
      
      // Check if there are new orders
      if (newOrders.length > availableOrders.length) {
        console.log(`New orders available! ${newOrders.length - availableOrders.length} new orders`);
      }
      
      setAvailableOrders(newOrders);
    } catch (err) {
      console.error('Failed to load available orders:', err);
      setAvailableOrders([]);
    } finally {
      if (showLoading) {
        setOrdersLoading(false);
      }
    }
  };

  const loadCurrentDelivery = async () => {
    try {
      const response = await deliveryApi.getMyDeliveries();
      console.log('My deliveries response:', response);
      const deliveries = response.deliveries || [];
      const ongoing = deliveries.find((d: Delivery) => 
        d.status === 'ONGOING' || d.status === 'ASSIGNED'
      );
      
      // If we have an ongoing delivery, load its orders
      if (ongoing) {
        console.log('Found ongoing delivery:', ongoing);
        // Load orders for this delivery
        try {
          const ordersResponse = await orderApi.getMyOrders();
          const allOrders = ordersResponse.orders || [];
          const deliveryOrders = allOrders.filter(order => order.delivery_id === ongoing.delivery_id);
          console.log('Orders for current delivery:', deliveryOrders);
          
          // Attach orders to delivery object
          ongoing.orders = deliveryOrders;
        } catch (err) {
          console.error('Failed to load orders for delivery:', err);
          ongoing.orders = [];
        }
      }
      
      setCurrentDelivery(ongoing || null);
      
      const completed = deliveries.filter((d: Delivery) => d.status === 'COMPLETED');
      setCompletedToday(completed);
    } catch (err) {
      console.error('Failed to load current delivery:', err);
      setCurrentDelivery(null);
      setCompletedToday([]);
    }
  };

  const loadStats = async () => {
    try {
      const walletResponse = await walletApi.getWallet();
      const deliveriesResponse = await deliveryApi.getMyDeliveries();
      console.log('Wallet response:', walletResponse);
      console.log('Deliveries for stats:', deliveriesResponse);
      
      const deliveries = deliveriesResponse.deliveries || [];
      const completed = deliveries.filter((d: Delivery) => d.status === 'COMPLETED');
      
      setStats({
        todayOrders: completed.length,
        earnings: walletResponse.balance || 0,
        distance: 45.2,
        avgRating: 4.8,
        onlineTime: '6h 30m'
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Set default stats if API fails
      setStats({
        todayOrders: 0,
        earnings: 0,
        distance: 0,
        avgRating: 0,
        onlineTime: '0h 0m'
      });
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setLoading(true);
      await deliveryApi.createDelivery({
        order_ids: [orderId],
        max_capacity: 1
      });
      alert('Order accepted successfully!');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!currentDelivery) return;
    
    if (!confirm('Start this delivery? This will mark it as ongoing.')) return;

    try {
      setLoading(true);
      await deliveryApi.updateDeliveryStatus(currentDelivery.delivery_id, {
        status: 'ONGOING'
      });
      alert('Delivery started successfully!');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!currentDelivery) return;
    
    if (!confirm('Mark this delivery as completed?')) return;

    try {
      setLoading(true);
      await deliveryApi.updateDeliveryStatus(currentDelivery.delivery_id, {
        status: 'COMPLETED'
      });
      alert('Delivery completed successfully!');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete delivery');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Badge */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Driver
              </span>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-6">
              {/* Online Status Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isOnline ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isOnline ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Settings className="w-5 h-5" />
              </button>

              {/* User Avatar */}
              <button 
                onClick={() => logout()}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold hover:bg-blue-700 transition"
              >
                {user?.username?.charAt(0).toUpperCase() || 'S'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hello {user?.username}! 👋
          </h2>
          <p className="text-gray-600">Have a great delivery day. Stay safe on the road!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Today's Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Today's Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.earnings.toLocaleString()}</p>
          </div>

          {/* Distance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-lg mb-4">
              <Navigation className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Distance</p>
            <p className="text-3xl font-bold text-gray-900">{stats.distance}km</p>
          </div>

          {/* Avg Rating */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-50 rounded-lg mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
          </div>

          {/* Online Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Online Time</p>
            <p className="text-2xl font-bold text-gray-900">{stats.onlineTime}</p>
          </div>
        </div>

        {/* Current Delivery */}
        {currentDelivery && (
          <div className="bg-white rounded-xl shadow-sm border border-l-4 border-l-blue-600 p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Current Delivery</h3>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {currentDelivery.status === 'ASSIGNED' ? 'Assigned' : 'Picked Up'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  Standard
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Addresses */}
              <div className="space-y-4">
                {currentDelivery.orders && currentDelivery.orders.length > 0 ? (
                  currentDelivery.orders.map((order: any, index: number) => (
                    <div key={order.order_id} className="border-b pb-3 mb-3 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-blue-600">#FD{order.order_id.toString().padStart(2, '0')}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {(order.price_estimate || 0).toLocaleString()} VND
                        </span>
                      </div>
                      <div className="flex items-start space-x-3 mb-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-600">Pickup:</p>
                          <p className="text-sm text-gray-900">{order.pickup_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-600">Deliver:</p>
                          <p className="text-sm text-gray-900">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Loading order details...</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Summary</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Total Orders</p>
                      <p className="font-semibold text-gray-900">
                        {currentDelivery.orders ? currentDelivery.orders.length : 0} orders
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-semibold">
                          {currentDelivery.orders ? 
                            currentDelivery.orders.reduce((sum: number, order: any) => sum + (order.distance_km || 3), 0) : 0
                          }km
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Estimated Time</p>
                        <p className="font-semibold">
                          {currentDelivery.orders ? currentDelivery.orders.length * 15 : 15} phút
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right mt-4">
                  <p className="text-2xl font-bold text-blue-600">#FD{currentDelivery.delivery_id.toString().padStart(2, '0')}</p>
                  <p className="text-sm text-gray-500">
                    {currentDelivery.orders ? 
                      currentDelivery.orders.reduce((sum: number, order: any) => sum + (order.price_estimate || 0), 0).toLocaleString() 
                      : 0
                    } VND
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Navigate</span>
              </button>
              
              {currentDelivery.status === 'ASSIGNED' ? (
                <button 
                  onClick={handleStartDelivery}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Package className="w-5 h-5" />
                  <span>Start Delivery</span>
                </button>
              ) : (
                <button 
                  onClick={handleCompleteDelivery}
                  disabled={loading}
                  className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Delivery</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Available Orders Section - Similar to Customer Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-gray-900">Available Orders</h3>
                <button
                  onClick={() => {
                    console.log('Manual refreshing available orders...');
                    loadAvailableOrders(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh orders"
                  disabled={ordersLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {initialLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No available orders</p>
              </div>
            ) : (
              availableOrders.map((order) => {
                console.log(`Available Order #FD${order.order_id.toString().padStart(2, '0')} status:`, order.status);
                
                const getStatusColor = (status: string) => {
                  switch (status?.toUpperCase()) {
                    case 'COMPLETED': return 'bg-green-100 text-green-800';
                    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
                    case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
                    case 'ONGOING': return 'bg-purple-100 text-purple-800';
                    case 'CANCELED': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                const getStatusText = (status: string) => {
                  switch (status?.toUpperCase()) {
                    case 'COMPLETED': return 'Đã giao';
                    case 'PENDING': return 'Chờ xử lý';
                    case 'ASSIGNED': return 'Đang giao';
                    case 'ONGOING': return 'Đang giao';
                    case 'CANCELED': return 'Đã hủy';
                    default: return status;
                  }
                };

                return (
                  <div key={order.order_id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <Package className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-gray-900">#FD{order.order_id.toString().padStart(2, '0')}</span>
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
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Details
                          </button>
                          
                          {order.status?.toUpperCase() === 'PENDING' && (
                            <button 
                              onClick={() => handleAcceptOrder(order.order_id)}
                              disabled={loading}
                              className="px-3 py-1 rounded text-sm font-medium inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Accept</span>
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

        {/* Completed Today Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Completed Today</h3>
          </div>
          
          <div className="divide-y">
            {completedToday.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No completed deliveries yet</p>
              </div>
            ) : (
              completedToday.map((delivery) => (
                <div key={delivery.delivery_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-semibold text-gray-900">#FD{delivery.delivery_id.toString().padStart(2, '0')}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(delivery.delivered_at || delivery.updated_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Completed at: {new Date(delivery.delivered_at || delivery.updated_at).toLocaleTimeString('vi-VN')}</p>
                        <p>Capacity: {delivery.max_capacity} orders</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        Earned
                      </div>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="font-medium">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShipperDashboardModern;
