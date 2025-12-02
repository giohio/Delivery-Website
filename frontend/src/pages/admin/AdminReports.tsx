import { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, Package, Users, Truck } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ShoppingBag, CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('7days');
  const [reportType, setReportType] = useState('revenue');

  const menuItems = [
    { path: '/admin/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Truck className="w-5 h-5" />, label: 'Shippers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: 12 },
    { path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
  ];

  // Revenue by day
  const revenueData = [
    { date: '07/11', revenue: 15000000, orders: 120, shippers: 15 },
    { date: '08/11', revenue: 18000000, orders: 145, shippers: 18 },
    { date: '09/11', revenue: 16500000, orders: 132, shippers: 16 },
    { date: '10/11', revenue: 20000000, orders: 160, shippers: 19 },
    { date: '11/11', revenue: 22000000, orders: 175, shippers: 20 },
    { date: '12/11', revenue: 25000000, orders: 198, shippers: 22 },
    { date: '13/11', revenue: 19500000, orders: 156, shippers: 18 },
  ];

  // Orders by category
  const categoryData = [
    { category: 'Food', orders: 450, revenue: 45000000 },
    { category: 'Documents', orders: 320, revenue: 12800000 },
    { category: 'Packages', orders: 280, revenue: 35600000 },
    { category: 'Groceries', orders: 184, revenue: 29440000 },
  ];

  // Top performing shippers
  const topShippers = [
    { name: 'Trần Thị B', deliveries: 156, revenue: 12500000, rating: 4.9 },
    { name: 'Phạm Văn D', deliveries: 142, revenue: 11800000, rating: 4.8 },
    { name: 'Nguyễn Văn G', deliveries: 138, revenue: 11200000, rating: 4.9 },
    { name: 'Lê Văn C', deliveries: 125, revenue: 10500000, rating: 4.7 },
    { name: 'Hoàng Thị E', deliveries: 118, revenue: 9800000, rating: 4.6 },
  ];

  const exportReport = () => {
    alert('Export functionality will be implemented with backend API');
  };

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive business insights and statistics</p>
          </div>
          <button
            onClick={exportReport}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="revenue">Revenue Report</option>
                <option value="orders">Orders Report</option>
                <option value="shippers">Shippers Performance</option>
                <option value="customers">Customer Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">136M₫</h3>
                <p className="text-purple-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5% vs last week
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">1,086</h3>
                <p className="text-blue-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.3% vs last week
                </p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Shippers</p>
                <h3 className="text-3xl font-bold mt-2">22</h3>
                <p className="text-orange-100 text-sm mt-2">156 deliveries/day avg</p>
              </div>
              <Truck className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg. Order Value</p>
                <h3 className="text-3xl font-bold mt-2">125K₫</h3>
                <p className="text-green-100 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.2% vs last week
                </p>
              </div>
              <Calendar className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Revenue (₫)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Category */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Shippers (This Week)</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Shipper</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Deliveries</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topShippers.map((shipper, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 
                        'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{shipper.name}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {shipper.deliveries}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-yellow-500 font-semibold">★ {shipper.rating}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-900 font-semibold">
                        {shipper.revenue.toLocaleString()}₫
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.5%</p>
                <p className="text-sm text-green-600">+2.3% from last week</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">28 min</p>
                <p className="text-sm text-green-600">-3 min from last week</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">4.7/5.0</p>
                <p className="text-sm text-green-600">+0.2 from last week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
