import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Navigation, Star, Clock, MapPin, Bell, Settings, CheckCircle, Phone, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deliveryApi, Delivery } from '../services/deliveryApi';
import { walletApi } from '../services/walletApi';
import { Order } from '../services/orderApi';

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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      loadAvailableOrders(),
      loadCurrentDelivery(),
      loadStats()
    ]);
  };

  const loadAvailableOrders = async () => {
    try {
      const response = await deliveryApi.getAvailableOrders();
      setAvailableOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to load available orders:', err);
    }
  };

  const loadCurrentDelivery = async () => {
    try {
      const response = await deliveryApi.getMyDeliveries();
      const deliveries = response.deliveries || [];
      const ongoing = deliveries.find((d: Delivery) => 
        d.status === 'ONGOING' || d.status === 'ASSIGNED'
      );
      setCurrentDelivery(ongoing || null);
      
      const completed = deliveries.filter((d: Delivery) => d.status === 'COMPLETED');
      setCompletedToday(completed);
    } catch (err) {
      console.error('Failed to load current delivery:', err);
    }
  };

  const loadStats = async () => {
    try {
      const walletResponse = await walletApi.getWallet();
      const deliveriesResponse = await deliveryApi.getMyDeliveries();
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
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pickup at:</p>
                    <p className="text-gray-900">Loading...</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deliver to:</p>
                    <p className="text-gray-900">Loading...</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <p className="font-semibold text-gray-900">Customer</p>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Distance</p>
                      <p className="font-semibold">{currentDelivery.max_capacity * 3}km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estimated Time</p>
                      <p className="font-semibold">15 phút</p>
                    </div>
                  </div>
                </div>

                <div className="text-right mt-4">
                  <p className="text-2xl font-bold text-blue-600">#FD{currentDelivery.delivery_id}</p>
                  <p className="text-sm text-gray-500">18,000 VND</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Navigate</span>
              </button>
              <button 
                onClick={handleCompleteDelivery}
                disabled={loading}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Delivery</span>
              </button>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Orders */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Available Orders</h3>
              <button
                onClick={loadAvailableOrders}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              {availableOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No available orders</p>
                </div>
              ) : (
                availableOrders.map((order) => {
                  const getStatusColor = (status: string) => {
                    switch(status) {
                      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
                      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
                      case 'ONGOING': return 'bg-purple-100 text-purple-800';
                      case 'COMPLETED': return 'bg-green-100 text-green-800';
                      case 'CANCELED': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const getStatusText = (status: string) => {
                    switch(status) {
                      case 'PENDING': return 'Đang chờ';
                      case 'ASSIGNED': return 'Đã giao';
                      case 'ONGOING': return 'Đang giao';
                      case 'COMPLETED': return 'Hoàn thành';
                      case 'CANCELED': return 'Đã hủy';
                      default: return status;
                    }
                  };

                  return (
                    <div key={order.order_id} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-lg">#FD{order.order_id}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {(order.price_estimate || 0).toLocaleString()} VND
                        </p>
                      </div>

                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 line-clamp-1">{order.pickup_address}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 line-clamp-1">{order.delivery_address}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{order.distance_km || 3}km</span>
                        <span>25 phút</span>
                        <span>1.5kg</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          Details
                        </button>
                        <button 
                          onClick={() => handleAcceptOrder(order.order_id)}
                          disabled={loading || order.status !== 'PENDING'}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {order.status === 'PENDING' ? 'Accept Order' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  );
                })
              
              )}
            </div>
          </div>

          {/* Completed Today */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Completed Today</h3>
            
            <div className="space-y-3">
              {completedToday.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No completed deliveries yet</p>
                </div>
              ) : (
                completedToday.map((delivery) => (
                  <div key={delivery.delivery_id} className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold">#FD{delivery.delivery_id}</p>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">22,000 VND</p>
                        <div className="flex items-center text-yellow-500 text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 font-medium">5</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>Completed at: {new Date(delivery.delivered_at).toLocaleTimeString()}</p>
                      <p>Distance: 7.8km</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShipperDashboardModern;
