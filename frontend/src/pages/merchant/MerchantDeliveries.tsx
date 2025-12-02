import { useState, useEffect } from 'react';
import { Truck, Package, Clock, CheckCircle, MapPin, User, DollarSign, ShoppingBag } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';

interface Delivery {
  delivery_id: number;
  shipper_name?: string;
  status: string;
  updated_at: string;
  order_id?: number;
  pickup_address?: string;
  delivery_address?: string;
}

export default function MerchantDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package className="w-5 h-5" />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
  ];

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantDeliveries();
      setDeliveries(response.deliveries || []);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filterStatus === 'all') return true;
    return delivery.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      picked_up: { color: 'bg-indigo-100 text-indigo-800', label: 'Picked Up' },
      in_transit: { color: 'bg-purple-100 text-purple-800', label: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    };

    const config = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600 mt-2">Track all your delivery activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">Total Deliveries</div>
            <div className="text-2xl font-bold mt-1">{deliveries.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-purple-100 text-sm">In Transit</div>
            <div className="text-2xl font-bold mt-1">
              {deliveries.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status.toLowerCase())).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="text-green-100 text-sm">Delivered</div>
            <div className="text-2xl font-bold mt-1">
              {deliveries.filter(d => d.status.toLowerCase() === 'delivered').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-red-100 text-sm">Failed</div>
            <div className="text-2xl font-bold mt-1">
              {deliveries.filter(d => d.status.toLowerCase() === 'failed').length}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Deliveries List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDeliveries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Truck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>No deliveries found</p>
                </div>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.delivery_id}
                    className="p-6 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Delivery #{delivery.delivery_id}
                            </h3>
                            {delivery.order_id && (
                              <p className="text-sm text-gray-500">Order #{delivery.order_id}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <User className="w-4 h-4 mr-2" />
                              Courier
                            </div>
                            <p className="text-gray-900 font-medium">
                              {delivery.shipper_name || 'Not assigned'}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Clock className="w-4 h-4 mr-2" />
                              Last Updated
                            </div>
                            <p className="text-gray-900">
                              {new Date(delivery.updated_at).toLocaleString('vi-VN')}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Status
                            </div>
                            {getStatusBadge(delivery.status)}
                          </div>
                        </div>

                        {(delivery.pickup_address || delivery.delivery_address) && (
                          <div className="mt-4 space-y-2">
                            {delivery.pickup_address && (
                              <div className="flex items-start text-sm">
                                <MapPin className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{delivery.pickup_address}</span>
                              </div>
                            )}
                            {delivery.delivery_address && (
                              <div className="flex items-start text-sm">
                                <MapPin className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{delivery.delivery_address}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            Delivery Status Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">Assigned:</span> Courier has been assigned to the order
            </div>
            <div>
              <span className="font-medium">Picked Up:</span> Courier has picked up the package
            </div>
            <div>
              <span className="font-medium">In Transit:</span> Package is on the way
            </div>
            <div>
              <span className="font-medium">Delivered:</span> Package has been delivered successfully
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
