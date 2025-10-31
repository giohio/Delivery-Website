import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Truck, Plus, User, LogOut, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { merchantApi, CreateMerchantOrderRequest } from '../services/merchantApi';

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

interface Delivery {
  delivery_id: number;
  shipper_name?: string;
  status: string;
  updated_at: string;
}

interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  method: string;
  status: string;
  paid_at?: string;
}

const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'deliveries' | 'payments'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateMerchantOrderRequest>({
    customer_id: 0,
    pickup_address: '',
    delivery_address: '',
    distance_km: 0,
    price_estimate: 0,
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'deliveries') {
      loadDeliveries();
    } else if (activeTab === 'payments') {
      loadPayments();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantDeliveries();
      setDeliveries(response.deliveries || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantPayments();
      setPayments(response.payments || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.pickup_address || !formData.delivery_address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await merchantApi.createOrderForCustomer(formData);
      alert('Order created successfully!');
      setShowCreateModal(false);
      setFormData({
        customer_id: 0,
        pickup_address: '',
        delivery_address: '',
        distance_km: 0,
        price_estimate: 0,
      });
      loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
    totalRevenue: payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0),
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <User className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium">{user?.fullName || 'Merchant'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completedOrders}</p>
              </div>
              <Truck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingOrders}</p>
              </div>
              <Package className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{stats.totalRevenue.toLocaleString()} ₫</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'deliveries'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Deliveries ({deliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payments ({payments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Your Orders</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.order_id}</p>
                        <p className="text-sm text-gray-500">
                          Customer: {order.customer_name || `ID: ${order.customer_id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">From:</p>
                          <p className="text-gray-600">{order.pickup_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">To:</p>
                          <p className="text-gray-600">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-blue-600">
                      {(order.price_estimate || 0).toLocaleString()} ₫
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Deliveries</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : deliveries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No deliveries yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {deliveries.map((delivery) => (
                  <div key={delivery.delivery_id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">Delivery #{delivery.delivery_id}</p>
                        <p className="text-sm text-gray-500">
                          Shipper: {delivery.shipper_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(delivery.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Payment Summary</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div key={payment.payment_id} className="p-6 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{payment.order_id}</p>
                      <p className="text-sm text-gray-500">Method: {payment.method}</p>
                      {payment.paid_at && (
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paid_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {payment.amount.toLocaleString()} ₫
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Order for Customer</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer ID *
                </label>
                <input
                  type="number"
                  required
                  value={formData.customer_id || ''}
                  onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter customer ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Your shop address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Customer address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km || ''}
                    onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="5.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.price_estimate || ''}
                    onChange={(e) => setFormData({ ...formData, price_estimate: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboard;
