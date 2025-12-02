import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Clock, ShoppingBag, Truck } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </DashboardLayout>
  );
}
