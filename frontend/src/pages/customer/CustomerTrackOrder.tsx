import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Wallet,
  Gift,
  User,
  Search,
  Navigation,
  Clock,
  Phone,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../../services/orderApi';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/create-order', icon: <PlusCircle />, label: 'Create Order' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerTrackOrder() {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  
  const [orderId, setOrderId] = useState(orderIdFromUrl || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderIdFromUrl) {
      handleSearch();
    }
  }, [orderIdFromUrl]);

  const handleSearch = async () => {
    if (!orderId) {
      setError('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getMyOrders();
      const foundOrder = response.orders.find((o: any) => o.order_id.toString() === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found');
        setOrder(null);
      }
    } catch (err) {
      setError('Failed to fetch order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTimeline = (status: string) => {
    const statuses = ['PENDING', 'ASSIGNED', 'ONGOING', 'COMPLETED'];
    const currentIndex = statuses.indexOf(status);
    
    return statuses.map((s, index) => ({
      label: s,
      active: index <= currentIndex,
      completed: index < currentIndex,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
        <p className="text-gray-600 mt-1">Real-time tracking of your deliveries</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Order ID (e.g., 123)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {order ? (
        <>
          {/* Status Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
            <div className="flex items-center justify-between">
              {getStatusTimeline(order.status).map((item, index) => (
                <div key={item.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.completed
                        ? 'bg-green-500 text-white'
                        : item.active
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {item.completed ? '✓' : index + 1}
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      item.active ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      item.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Live Tracking</h3>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center space-x-1">
                    <Navigation className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Map tracking coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Real-time GPS tracking will be available here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-900">#{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(order.price_estimate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Addresses</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Pickup</p>
                    </div>
                    <p className="text-sm text-gray-900 ml-6">{order.pickup_address}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">Delivery</p>
                    </div>
                    <p className="text-sm text-gray-900 ml-6">{order.delivery_address}</p>
                  </div>
                </div>
              </div>

              {/* Shipper Info (if assigned) */}
              {order.status !== 'PENDING' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Shipper Info</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Shipper Name</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">4.8 (120 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Call Shipper</span>
                  </button>
                </div>
              )}

              {/* ETA */}
              {order.status === 'ONGOING' && (
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-6 h-6" />
                    <h3 className="font-semibold">Estimated Arrival</h3>
                  </div>
                  <p className="text-3xl font-bold">15 mins</p>
                  <p className="text-teal-100 text-sm mt-1">Your order is on the way!</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Order</h3>
          <p className="text-gray-600">Enter your order ID above to see real-time tracking</p>
        </div>
      )}
    </DashboardLayout>
  );
}
