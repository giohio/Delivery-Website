import { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Users, DollarSign, TrendingUp, ShoppingBag, Truck, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminDashboard() {
  const [stats] = useState({
    totalRevenue: 125000,
    totalOrders: 1234,
    activeUsers: 567,
    activeCouriers: 89,
    pendingKYC: 12,
    todayOrders: 45,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
  });

  // Revenue data for last 7 days
  const revenueData = [
    { name: 'Mon', revenue: 15000, orders: 120 },
    { name: 'Tue', revenue: 18000, orders: 145 },
    { name: 'Wed', revenue: 16500, orders: 132 },
    { name: 'Thu', revenue: 20000, orders: 160 },
    { name: 'Fri', revenue: 22000, orders: 175 },
    { name: 'Sat', revenue: 25000, orders: 198 },
    { name: 'Sun', revenue: 19500, orders: 156 },
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Completed', value: 856, color: '#10b981' },
    { name: 'In Progress', value: 234, color: '#3b82f6' },
    { name: 'Pending', value: 89, color: '#f59e0b' },
    { name: 'Cancelled', value: 55, color: '#ef4444' },
  ];

  // Top performers
  const topCouriers = [
    { id: 1, name: 'Nguyễn Văn A', deliveries: 156, rating: 4.9, revenue: 12500 },
    { id: 2, name: 'Trần Thị B', deliveries: 142, rating: 4.8, revenue: 11800 },
    { id: 3, name: 'Lê Văn C', deliveries: 138, rating: 4.7, revenue: 11200 },
    { id: 4, name: 'Phạm Thị D', deliveries: 125, rating: 4.9, revenue: 10500 },
    { id: 5, name: 'Hoàng Văn E', deliveries: 118, rating: 4.6, revenue: 9800 },
  ];

  const menuItems = [
    { path: '/admin/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Truck className="w-5 h-5" />, label: 'Couriers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: stats.pendingKYC },
    { path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
  ];

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of platform performance and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-purple-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{stats.revenueGrowth}% from last month
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalOrders.toLocaleString()}</h3>
                <p className="text-blue-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{stats.orderGrowth}% from last month
                </p>
              </div>
              <ShoppingBag className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <h3 className="text-3xl font-bold mt-2">{stats.activeUsers}</h3>
                <p className="text-green-100 text-sm mt-2">Today: {stats.todayOrders} orders</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Couriers</p>
                <h3 className="text-3xl font-bold mt-2">{stats.activeCouriers}</h3>
                <p className="text-orange-100 text-sm mt-2">Pending KYC: {stats.pendingKYC}</p>
              </div>
              <Truck className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#8b5cf6" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {orderStatusData.map((status) => (
                <div key={status.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-sm text-gray-600">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Couriers</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Courier</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Deliveries</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCouriers.map((courier, index) => (
                  <tr key={courier.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{courier.name}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {courier.deliveries}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-yellow-500 font-semibold">★ {courier.rating}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-900 font-semibold">${courier.revenue.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Actions</h3>
              <ul className="space-y-2">
                <li className="text-gray-700">• <strong>{stats.pendingKYC}</strong> courier KYC applications waiting for approval</li>
                <li className="text-gray-700">• <strong>3</strong> dispute cases need attention</li>
                <li className="text-gray-700">• <strong>7</strong> merchant verifications pending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
