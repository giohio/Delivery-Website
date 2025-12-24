import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Clock, ShoppingBag, Truck, Key, Plus, Copy, Trash2, RefreshCw, Shield } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';
import { apiKeyService } from '../../services/apiKeyService';

export default function MerchantDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    avgDeliveryTime: 0,
  });

  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<any>(null);

  const loadApiKeys = async () => {
    try {
      const keys = await apiKeyService.getApiKeys();
      console.log('✅ Loaded API keys:', keys);
      setApiKeys(keys);
    } catch (error: any) {
      console.error('❌ Failed to load API keys:', error);
      // Set empty array so UI still shows
      setApiKeys([]);
    }
  };

  const handleCreateKey = async (data: any) => {
    try {
      const result = await apiKeyService.createApiKey(data);
      console.log('✅ Created API key:', result);
      setNewKeyData(result);
      setShowCreateModal(false);
      setShowSecretModal(true);
      await loadApiKeys();
    } catch (error: any) {
      alert('Failed to create API key: ' + error.message);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm('Delete this API key?')) return;
    try {
      await apiKeyService.deleteApiKey(keyId);
      await loadApiKeys();
      alert('Deleted successfully');
    } catch (error: any) {
      alert('Failed: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantOrders();
      const orders = response.orders || [];
      
      const completed = orders.filter((o: any) => o.status === 'completed');
      const active = orders.filter((o: any) => ['pending', 'accepted', 'picked_up'].includes(o.status));
      
      setStats({
        totalOrders: orders.length,
        activeOrders: active.length,
        completedToday: completed.length,
        totalRevenue: completed.reduce((sum: number, o: any) => sum + (o.price_estimate || 0), 0),
        pendingPayments: 5,
        avgDeliveryTime: 32,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadApiKeys();
  }, []);

  const orderData = [
    { date: '07/11', orders: 25, revenue: 2500000 },
    { date: '08/11', orders: 30, revenue: 3200000 },
    { date: '09/11', orders: 28, revenue: 2800000 },
    { date: '10/11', orders: 35, revenue: 3800000 },
    { date: '11/11', orders: 32, revenue: 3400000 },
    { date: '12/11', orders: 40, revenue: 4200000 },
    { date: '13/11', orders: 38, revenue: 3900000 },
  ];

  const statusData = [
    { status: 'Completed', count: 156 },
    { status: 'In Progress', count: 23 },
    { status: 'Pending', count: 12 },
    { status: 'Cancelled', count: 8 },
  ];

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package className="w-5 h-5" />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
    { path: '#api-keys', icon: <Key className="w-5 h-5" />, label: 'API Keys', onClick: () => {
      const apiSection = document.getElementById('api-keys-section');
      if (apiSection) apiSection.scrollIntoView({ behavior: 'smooth' });
    }},
  ];

  if (loading) {
    return (
      <DashboardLayout role="merchant" menuItems={menuItems}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your business performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalOrders}</h3>
                <p className="text-blue-100 text-sm mt-2">All time</p>
              </div>
              <ShoppingBag className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Orders</p>
                <h3 className="text-3xl font-bold mt-2">{stats.activeOrders}</h3>
                <p className="text-orange-100 text-sm mt-2">In progress</p>
              </div>
              <Truck className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">{(stats.totalRevenue / 1000).toFixed(0)}K₫</h3>
                <p className="text-green-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5% this month
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Delivery Time</p>
                <h3 className="text-3xl font-bold mt-2">{stats.avgDeliveryTime} min</h3>
                <p className="text-purple-100 text-sm mt-2">Last 30 days</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toLocaleString()}₫`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Revenue (₫)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/merchant/create-order'}
              className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Create New Order</h4>
              <p className="text-sm text-gray-600 mt-1">Place a new delivery order</p>
            </button>

            <button
              onClick={() => window.location.href = '/merchant/orders'}
              className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <ShoppingBag className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">View All Orders</h4>
              <p className="text-sm text-gray-600 mt-1">Manage your order history</p>
            </button>

            <button
              onClick={() => window.location.href = '/merchant/payments'}
              className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Payment History</h4>
              <p className="text-sm text-gray-600 mt-1">View payment records</p>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white border-2 border-indigo-300 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all text-left"
            >
              <Key className="w-8 h-8 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-gray-900">API Keys</h4>
              <p className="text-sm text-gray-600 mt-1">Manage integration keys</p>
            </button>
          </div>
        </div>

        {/* Recent Orders Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.completedToday}</div>
              <div className="text-sm text-gray-600 mt-1">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalOrders > 0 ? ((stats.completedToday / stats.totalOrders) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.pendingPayments}</div>
              <div className="text-sm text-gray-600 mt-1">Pending Payments</div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div id="api-keys-section" className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">API Keys</h3>
                <p className="text-sm text-gray-600">Manage API keys for third-party integrations ({apiKeys?.length || 0} keys)</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create API Key
            </button>
          </div>

          {(!apiKeys || apiKeys.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No API keys yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first API key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key: any) => (
                <div key={key.api_key_id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{key.key_name}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          key.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.api_key_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">API Key:</span>
                      <button
                        onClick={() => copyToClipboard(key.api_key)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <code className="text-sm font-mono text-gray-800 block bg-white px-3 py-2 rounded border break-all">
                      {key.api_key}
                    </code>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Permissions: {key.permissions.join(', ')}
                      </span>
                      <span className="text-gray-600">
                        Rate: {key.rate_limit}/day
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateAPIKeyModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateKey}
          />
        )}

        {showSecretModal && newKeyData && (
          <SecretModal
            data={newKeyData}
            onClose={() => {
              setShowSecretModal(false);
              setNewKeyData(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Create API Key Modal
function CreateAPIKeyModal({ onClose, onCreate }: any) {
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['orders:read']);
  const [rateLimit, setRateLimit] = useState(1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ key_name: keyName, permissions, rate_limit: rateLimit, expires_in_days: 365 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold mb-6">Create New API Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Key Name *</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Mobile App, POS System"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Permissions *</label>
            <label className="flex items-center p-3 border rounded-lg mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.includes('orders:read')}
                onChange={() => {
                  if (permissions.includes('orders:read')) {
                    setPermissions(permissions.filter(p => p !== 'orders:read'));
                  } else {
                    setPermissions([...permissions, 'orders:read']);
                  }
                }}
                className="mr-3"
              />
              <div>
                <div className="font-medium">orders:read</div>
                <div className="text-xs text-gray-600">View orders</div>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.includes('orders:write')}
                onChange={() => {
                  if (permissions.includes('orders:write')) {
                    setPermissions(permissions.filter(p => p !== 'orders:write'));
                  } else {
                    setPermissions([...permissions, 'orders:write']);
                  }
                }}
                className="mr-3"
              />
              <div>
                <div className="font-medium">orders:write</div>
                <div className="text-xs text-gray-600">Create/update orders</div>
              </div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rate Limit (requests/day) *</label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(parseInt(e.target.value))}
              min="100"
              max="100000"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={permissions.length === 0} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create
            </button>
            <button type="button" onClick={onClose} className="flex-1 border px-6 py-3 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Secret Modal
function SecretModal({ data, onClose }: any) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">API Key Created!</h2>
          <p className="text-gray-600 mt-2">{data.key_name}</p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <p className="font-bold text-yellow-900">⚠️ Save these credentials now!</p>
          <p className="text-sm text-yellow-800">The secret will only be shown once.</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold">API Key</span>
              <button onClick={() => copyToClipboard(data.api_key)} className="text-blue-600 text-sm flex items-center gap-1">
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <code className="block p-3 bg-white border rounded text-sm break-all">{data.api_key}</code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold">API Secret</span>
              <button onClick={() => copyToClipboard(data.api_secret)} className="text-blue-600 text-sm flex items-center gap-1">
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <code className="block p-3 bg-white border rounded text-sm break-all">{data.api_secret}</code>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          I've Saved the Credentials
        </button>
      </div>
    </div>
  );
}
