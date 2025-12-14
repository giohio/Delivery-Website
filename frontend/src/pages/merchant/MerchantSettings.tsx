import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Store,
  Settings,
  Lock,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Calendar,
  Shield,
  Activity,
} from 'lucide-react';
import { userApi } from '../../services/userApi';
import { apiKeyService, ApiKey, CreateApiKeyResponse } from '../../services/apiKeyService';

const menuItems = [
  { path: '/merchant/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/merchant/orders', icon: <Package />, label: 'Orders' },
  { path: '/merchant/analytics', icon: <TrendingUp />, label: 'Analytics' },
  { path: '/merchant/profile', icon: <Store />, label: 'Profile' },
];

export default function MerchantSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    paymentAlerts: true,
  });

  // API Keys states
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<CreateApiKeyResponse | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoadingKeys(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await userApi.changePassword(currentPassword, newPassword);
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your business account and preferences</p>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-6">
            <Lock className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New Orders</p>
                <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newOrders}
                  onChange={(e) =>
                    setNotifications({ ...notifications, newOrders: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">Status changes on your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.orderUpdates}
                  onChange={(e) =>
                    setNotifications({ ...notifications, orderUpdates: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Payment Alerts</p>
                <p className="text-sm text-gray-600">Payment received and settlement updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.paymentAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, paymentAlerts: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Business Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (GMT+7)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                <option value="Asia/Singapore">Singapore (GMT+8)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Key className="w-6 h-6 text-gray-700 mr-2" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-600">Manage API keys for third-party integrations</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Key
            </button>
          </div>

          {loadingKeys ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No API keys created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first API key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <ApiKeyCard
                  key={key.api_key_id}
                  apiKey={key}
                  onDelete={async () => {
                    if (confirm('Are you sure you want to delete this API key?')) {
                      try {
                        await apiKeyService.deleteApiKey(key.api_key_id);
                        await loadApiKeys();
                        alert('API key deleted successfully');
                      } catch (error: any) {
                        alert(error.message);
                      }
                    }
                  }}
                  onToggle={async () => {
                    try {
                      await apiKeyService.updateApiKey(key.api_key_id, {
                        is_active: !key.is_active
                      });
                      await loadApiKeys();
                    } catch (error: any) {
                      alert(error.message);
                    }
                  }}
                  onRegenerateSecret={async () => {
                    if (confirm('This will invalidate the current secret. Continue?')) {
                      try {
                        const result = await apiKeyService.regenerateSecret(key.api_key_id);
                        setNewApiKeyData({
                          message: 'Secret regenerated',
                          api_key_id: key.api_key_id,
                          api_key: key.api_key,
                          api_secret: result.api_secret,
                          key_name: key.key_name,
                          permissions: key.permissions,
                          rate_limit: key.rate_limit,
                          expires_at: key.expires_at,
                          created_at: key.created_at,
                          warning: 'Save the new secret now!'
                        });
                        setShowSecretModal(true);
                        await loadApiKeys();
                      } catch (error: any) {
                        alert(error.message);
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            try {
              const result = await apiKeyService.createApiKey(data);
              setNewApiKeyData(result);
              setShowCreateModal(false);
              setShowSecretModal(true);
              await loadApiKeys();
            } catch (error: any) {
              alert(error.message);
            }
          }}
        />
      )}

      {/* Show Secret Modal */}
      {showSecretModal && newApiKeyData && (
        <ShowSecretModal
          data={newApiKeyData}
          onClose={() => {
            setShowSecretModal(false);
            setNewApiKeyData(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

// API Key Card Component
function ApiKeyCard({ 
  apiKey, 
  onDelete, 
  onToggle, 
  onRegenerateSecret 
}: { 
  apiKey: ApiKey; 
  onDelete: () => void; 
  onToggle: () => void;
  onRegenerateSecret: () => void;
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{apiKey.key_name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              apiKey.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {apiKey.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Created: {formatDate(apiKey.created_at)}
            </div>
            {apiKey.last_used_at && (
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Last used: {formatDate(apiKey.last_used_at)}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 p-2"
            title={apiKey.is_active ? 'Disable' : 'Enable'}
          >
            <Shield className="w-5 h-5" />
          </button>
          <button
            onClick={onRegenerateSecret}
            className="text-orange-600 hover:text-orange-700 p-2"
            title="Regenerate Secret"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 p-2"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 bg-gray-50 p-3 rounded">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">API Key:</span>
            <button
              onClick={() => copyToClipboard(apiKey.api_key)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <code className="text-sm font-mono text-gray-800 block truncate">{apiKey.api_key}</code>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              Permissions: <span className="font-medium text-gray-800">{apiKey.permissions.join(', ')}</span>
            </span>
            <span className="text-gray-600">
              Rate: <span className="font-medium text-gray-800">{apiKey.rate_limit}/day</span>
            </span>
          </div>
          {apiKey.expires_at && (
            <span className="text-gray-600">
              Expires: <span className="font-medium text-gray-800">{formatDate(apiKey.expires_at)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Create API Key Modal
function CreateApiKeyModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void; 
  onCreate: (data: any) => void;
}) {
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['orders:read']);
  const [rateLimit, setRateLimit] = useState(1000);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(365);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      key_name: keyName,
      permissions,
      rate_limit: rateLimit,
      expires_in_days: expiresInDays
    });
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New API Key</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Name *
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Mobile App, Web Dashboard"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={permissions.includes('orders:read')}
                  onChange={() => togglePermission('orders:read')}
                  className="mr-2"
                />
                <span className="text-sm">orders:read - Read orders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={permissions.includes('orders:write')}
                  onChange={() => togglePermission('orders:write')}
                  className="mr-2"
                />
                <span className="text-sm">orders:write - Create/Update orders</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit (requests/day) *
            </label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(parseInt(e.target.value))}
              min="100"
              max="100000"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In (days)
            </label>
            <select
              value={expiresInDays || ''}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">365 days</option>
              <option value="730">730 days (2 years)</option>
              <option value="">Never</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={permissions.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              Create API Key
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Show Secret Modal
function ShowSecretModal({ 
  data, 
  onClose 
}: { 
  data: CreateApiKeyResponse; 
  onClose: () => void;
}) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Created Successfully!</h2>
          <p className="text-gray-600">{data.key_name}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800">⚠️ Important: Save these credentials now!</p>
          <p className="text-xs text-yellow-700 mt-1">
            The API Secret will only be shown once. You won't be able to see it again.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Key</span>
              <button
                onClick={() => copyToClipboard(data.api_key, 'API Key')}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
            <code className="block p-2 bg-white border border-gray-200 rounded text-sm font-mono break-all">
              {data.api_key}
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Secret</span>
              <button
                onClick={() => copyToClipboard(data.api_secret, 'API Secret')}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
            <code className="block p-2 bg-white border border-gray-200 rounded text-sm font-mono break-all">
              {data.api_secret}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Permissions:</span>
              <p className="font-medium text-gray-900">{data.permissions.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-600">Rate Limit:</span>
              <p className="font-medium text-gray-900">{data.rate_limit} requests/day</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-medium"
          >
            I've Saved the Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
