import React, { useState, useEffect } from 'react';
import { Package, MapPin, Clock, DollarSign, CheckCircle, Navigation } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { deliveryApi } from '../../services/deliveryApi';
import { Order } from '../../services/orderApi';

const ShipperAvailableOrdersPage: React.FC = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);

  const menuItems = [
    { path: '/shipper/dashboard', label: 'Dashboard', icon: <Package /> },
    { path: '/shipper/deliveries', label: 'My Deliveries', icon: <Package /> },
    { path: '/shipper/available-orders', label: 'Available Orders', icon: <Navigation /> },
    { path: '/shipper/earnings', label: 'Earnings', icon: <DollarSign /> },
    { path: '/shipper/profile', label: 'Profile', icon: <Package /> },
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
      const response = await deliveryApi.getAvailableOrders();
      setAvailableOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to load available orders:', err);
      setAvailableOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setAccepting(orderId);
      await deliveryApi.acceptOrder(orderId);
      
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

  const calculateDistance = (order: Order): string => {
    // Calculate real distance using Haversine formula if coordinates available
    if (order.pickup_lat && order.pickup_lng && 
        order.delivery_lat && order.delivery_lng) {
      const R = 6371; // Earth radius in km
      const dLat = (order.delivery_lat - order.pickup_lat) * Math.PI / 180;
      const dLon = (order.delivery_lng - order.pickup_lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(order.pickup_lat * Math.PI / 180) * 
        Math.cos(order.delivery_lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance.toFixed(1);
    }
    // Fallback to price_estimate calculation if available
    if (order.price_estimate && order.distance_km) {
      return order.distance_km.toFixed(1);
    }
    return '0.0';
  };

  const calculateEstimatedFee = (order: Order): number => {
    // Use real price_estimate from order if available
    if (order.price_estimate) {
      return order.price_estimate;
    }
    // Fallback to calculation
    const distance = parseFloat(calculateDistance(order));
    const baseFee = 50000;
    const perKmFee = 5000;
    return baseFee + (distance * perKmFee);
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} role="shipper">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} role="shipper">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>
            <p className="text-gray-600 mt-1">Accept orders to start earning.</p>
          </div>
          <button
            onClick={() => loadAvailableOrders()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
          >
            <Package className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">New Orders Available</h3>
              <p className="text-sm text-orange-700 mt-1">
                {availableOrders.length} {availableOrders.length === 1 ? 'order is' : 'orders are'} waiting to be delivered. Accept now to start earning!
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
                    <p className="text-sm text-gray-500">Estimated Fee</p>
                    <p className="text-2xl font-bold text-green-600">{Number(calculateEstimatedFee(order)).toLocaleString('vi-VN')}₫</p>
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
                    <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Distance: ~{calculateDistance(order)} km</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Posted: {new Date(order.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Status: {order.status}</span>
                  </div>
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAcceptOrder(order.order_id)}
                  disabled={accepting === order.order_id}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
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
                className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Refresh Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperAvailableOrdersPage;
