import { useState, useEffect } from 'react';
import { Search, Eye, Package, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';
import { ShoppingBag, DollarSign } from 'lucide-react';

interface Order {
  order_id: number;
  customer_id: number;
  customer_name?: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  price_estimate?: number;
  distance_km?: number;
  created_at: string;
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package className="w-5 h-5" />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toString().includes(searchTerm) ||
      (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', icon: Truck, label: 'Accepted' },
      picked_up: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Picked Up' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Manage all your delivery orders</p>
          </div>
          <button
            onClick={() => window.location.href = '/merchant/create-order'}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-medium"
          >
            + Create Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">Total Orders</div>
            <div className="text-2xl font-bold mt-1">{orders.length}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-yellow-100 text-sm">Pending</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-4 text-white">
            <div className="text-indigo-100 text-sm">In Progress</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => ['accepted', 'picked_up'].includes(o.status)).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="text-green-100 text-sm">Completed</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="picked_up">Picked Up</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Route</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">#{order.order_id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">{order.customer_name || `Customer #${order.customer_id}`}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-sm max-w-xs">
                          <div className="flex items-start">
                            <MapPin className="w-3 h-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 line-clamp-1">{order.pickup_address}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="w-3 h-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 line-clamp-1">{order.delivery_address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-semibold text-gray-900">
                          {order.price_estimate?.toLocaleString('vi-VN') || '0'}₫
                        </span>
                        {order.distance_km && (
                          <div className="text-xs text-gray-500">{order.distance_km} km</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-blue-100 mt-1">Order #{selectedOrder.order_id}</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {selectedOrder.customer_name || `Customer #${selectedOrder.customer_id}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {selectedOrder.price_estimate?.toLocaleString('vi-VN') || '0'}₫
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Distance</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {selectedOrder.distance_km || 0} km
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup Address</label>
                  <p className="mt-1 text-gray-900">{selectedOrder.pickup_address}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                  <p className="mt-1 text-gray-900">{selectedOrder.delivery_address}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
