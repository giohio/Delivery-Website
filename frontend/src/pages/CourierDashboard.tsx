import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Navigation, Star, Clock, MapPin, Phone, CheckCircle, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  pickup: {
    address: string;
    name?: string;
  };
  delivery: {
    address: string;
    customer: string;
    phone: string;
  };
  distance: string;
  estimatedTime: string;
  price: string;
  weight?: string;
  status: 'available' | 'picked' | 'completed';
  rating?: number;
  completedTime?: string;
  category?: string;
}

const CourierDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notifications = [
    { id: 1, title: 'New orders', message: '2 available orders near you', time: '3 minutes ago', unread: true },
    { id: 2, title: 'Payment received', message: 'You received 18,000 VND from order #FD001235', time: '15 minutes ago', unread: true },
    { id: 3, title: '5-star rating', message: 'Customer gave you 5 stars', time: '1 hour ago', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data
  const stats = {
    todayOrders: 8,
    todayEarnings: '180,000',
    totalDistance: '45.2',
    averageRating: 4.8,
    onlineTime: '6h 30m'
  };

  const currentOrder: Order | null = {
    id: '#FD2024001235',
    pickup: {
      address: 'Nhà hàng XYZ - 789 Trần Hưng Đạo, Q1',
    },
    delivery: {
      address: '321 Võ Văn Tần, Q3, TP.HCM',
      customer: 'Trần Thị B',
      phone: '0901234567'
    },
    distance: '3.1km',
    estimatedTime: '15 phút',
    price: '18,000',
    status: 'picked'
  };

  const availableOrders: Order[] = [
    {
      id: '#FD2024001234',
      pickup: {
        name: 'Shop ABC',
        address: '123 Nguyễn Huệ, Q1'
      },
      delivery: {
        address: '456 Lê Lợi, Q3, TP.HCM',
        customer: 'Nguyễn Văn A',
        phone: '0909123456'
      },
      distance: '5.2km',
      estimatedTime: '25 phút',
      price: '25,000',
      weight: '1.5kg',
      status: 'available'
    }
  ];

  const completedOrders: Order[] = [
    {
      id: '#FD2024001236',
      pickup: {
        name: 'Lê Văn C',
        address: 'Lê Văn C • 7.8km'
      },
      delivery: {
        address: 'Thực phẩm tươi sống',
        customer: 'Lê Văn C',
        phone: ''
      },
      distance: '7.8km',
      estimatedTime: '',
      price: '22,000',
      status: 'completed',
      rating: 5,
      completedTime: '12:42'
    }
  ];

  const handleNavigate = () => {
    if (currentOrder) {
      // Open Google Maps with delivery address
      const address = encodeURIComponent(currentOrder.delivery.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    }
  };

  const handleCompleteDelivery = () => {
    if (confirm('Delivered to customer?')) {
      alert('Delivery completed! Payment will be added to your account.');
      // In real app: call API to mark delivery as complete
    }
  };

  const handleAcceptOrder = (order: Order) => {
    if (confirm(`Accept order ${order.id}?`)) {
      alert(`Accepted order ${order.id}. Please go to pickup address!`);
      // In real app: call API to accept order
    }
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-200">
                Driver
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Online Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isOnline ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

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
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'SK'}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Driver'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'courier@example.com'}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hello {user?.fullName || 'Driver'}! 👋</h2>
          <p className="text-gray-600">Have a great delivery day. Stay safe on the road!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Today's Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Earnings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayEarnings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Navigation className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Distance</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDistance}km</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Online Time</p>
            <p className="text-3xl font-bold text-gray-900">{stats.onlineTime}</p>
          </div>
        </div>

        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Current Delivery</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Picked Up
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Standard
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Pickup at:</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-gray-900">{currentOrder.pickup.address}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Deliver to:</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-gray-900">{currentOrder.delivery.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{currentOrder.delivery.customer}</span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Distance</p>
                    <p className="font-bold text-gray-900">{currentOrder.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
                    <p className="font-bold text-gray-900">{currentOrder.estimatedTime}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{currentOrder.id}</p>
                  <p className="text-sm text-gray-600">{currentOrder.price} VNĐ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNavigate}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Navigation className="w-5 h-5" />
                Navigate
              </button>
              <button
                onClick={handleCompleteDelivery}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Delivery
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Orders */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Available Orders</h3>
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{order.id}</span>
                    <span className="text-lg font-bold text-blue-600">{order.price} VNĐ</span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{order.pickup.name} - {order.pickup.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{order.delivery.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">{order.distance}</span>
                    <span className="text-gray-600">{order.estimatedTime}</span>
                    <span className="text-gray-600">{order.weight}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewOrderDetail(order)}
                      className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleAcceptOrder(order)}
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Today */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Completed Today</h3>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{order.id}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-green-600">{order.price} VNĐ</span>
                      <div className="flex items-center gap-1 ml-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{order.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Completed at: {order.completedTime}</p>
                    <p className="text-sm font-medium text-gray-900">{order.pickup.address}</p>
                    <p className="text-sm text-gray-600">{order.delivery.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Order Details {selectedOrder.id}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pickup Location:</p>
                <p className="font-medium">{selectedOrder.pickup.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivery Location:</p>
                <p className="font-medium">{selectedOrder.delivery.address}</p>
              </div>
              {selectedOrder.delivery.customer && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer:</p>
                  <p className="font-medium">{selectedOrder.delivery.customer}</p>
                  {selectedOrder.delivery.phone && (
                    <p className="text-sm text-gray-500">{selectedOrder.delivery.phone}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Distance:</p>
                  <p className="font-bold">{selectedOrder.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Fee:</p>
                  <p className="font-bold text-blue-600">{selectedOrder.price} VND</p>
                </div>
              </div>
              {selectedOrder.weight && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Weight:</p>
                  <p className="font-medium">{selectedOrder.weight}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowOrderDetailModal(false)} 
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
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
                  <span className="text-sm font-medium">Auto Accept Orders</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Sound Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Battery Saver Mode</span>
                  <input type="checkbox" className="w-4 h-4" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accept Radius (km)</label>
                <input type="number" defaultValue="5" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Motorcycle</option>
                  <option>Car</option>
                  <option>Small Truck</option>
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

export default CourierDashboard;
