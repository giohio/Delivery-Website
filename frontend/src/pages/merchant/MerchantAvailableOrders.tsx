import { useState, useEffect } from 'react';
import { Package, MapPin, Clock, DollarSign, CheckCircle, ShoppingBag, Truck, User, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';

interface Order {
  order_id: number;
  customer_id: number;
  customer_name?: string;
  merchant_id?: number;
  pickup_address: string;
  delivery_address: string;
  status: string;
  price_estimate?: number;
  distance_km?: number;
  created_at: string;
}

export default function MerchantAvailableOrders() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  console.log('📦 MerchantAvailableOrders loaded, orders count:', availableOrders.length);

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign />, label: 'Payments' },
  ];

  useEffect(() => {
    loadAvailableOrders();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadAvailableOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAvailableOrders = async () => {
    try {
      console.log('🔄 Loading available orders...');
      setError('');
      const response = await merchantApi.getAvailableOrders();
      console.log('✅ Available orders response:', response);
      setAvailableOrders(response.orders || []);
    } catch (err: any) {
      console.error('❌ Failed to load available orders:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load orders';
      setError(errorMsg);
      setAvailableOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setAccepting(orderId);
      await merchantApi.acceptOrder(orderId);
      
      // Reload orders after accepting
      await loadAvailableOrders();
      
      alert('Order accepted successfully!');
    } catch (err: any) {
      console.error('Failed to accept order:', err);
      alert(err.message || 'Failed to accept order');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} role="merchant">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} role="merchant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>
            <p className="text-gray-600 mt-1">Accept customer orders to manage their deliveries.</p>
          </div>
          <button
            onClick={() => loadAvailableOrders()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Package className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Orders</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure you're logged in as a merchant and the backend is running on port 5000.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">New Orders Available</h3>
              <p className="text-sm text-blue-700 mt-1">
                {availableOrders.length} {availableOrders.length === 1 ? 'order is' : 'orders are'} waiting to be assigned. Accept now to manage the delivery!
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {availableOrders.length > 0 ? (
            availableOrders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_id}</h3>
                    <p className="text-sm text-gray-500">Customer ID: {order.customer_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Estimated Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      {order.price_estimate ? order.price_estimate.toLocaleString() : 'N/A'}₫
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                      <p className="text-gray-900">{order.pickup_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">DELIVERY</p>
                      <p className="text-gray-900">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Distance: ~{order.distance_km ? Number(order.distance_km).toFixed(1) : 'N/A'} km</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Posted: {new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Status: {order.status}</span>
                  </div>
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAcceptOrder(order.order_id)}
                  disabled={accepting === order.order_id}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {accepting === order.order_id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept This Order
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No available orders at the moment</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for new delivery opportunities</p>
              <button
                onClick={() => loadAvailableOrders()}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
