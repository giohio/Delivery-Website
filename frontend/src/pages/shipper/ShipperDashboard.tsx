import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Star, Clock, TrendingUp, Calendar, Navigation } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { deliveryApi } from '../../services/deliveryApi';
import { walletApi } from '../../services/walletApi';
import { ratingApi } from '../../services/ratingApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ShipperDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalDeliveries: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: '/shipper/dashboard', label: 'Dashboard', icon: <Package /> },
    { path: '/shipper/deliveries', label: 'My Deliveries', icon: <Package /> },
    { path: '/shipper/available-orders', label: 'Available Orders', icon: <Navigation /> },
    { path: '/shipper/earnings', label: 'Earnings', icon: <DollarSign /> },
    { path: '/shipper/profile', label: 'Profile', icon: <Star /> },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load deliveries
      const deliveriesResponse = await deliveryApi.getMyDeliveries();
      const deliveries = deliveriesResponse.deliveries || [];
      
      // Load wallet balance
      let totalBalance = 0;
      try {
        const walletResponse = await walletApi.getWallet();
        totalBalance = walletResponse.wallet?.balance || 0;
      } catch (err) {
        console.error('Failed to load wallet:', err);
      }
      
      // Load ratings from backend
      let avgRating = 0;
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const ratingsResponse = await ratingApi.getShipperRatings(user.user_id);
          const ratings = ratingsResponse.ratings || [];
          if (ratings.length > 0) {
            const totalScore = ratings.reduce((sum: number, r: any) => sum + r.score, 0);
            avgRating = totalScore / ratings.length;
          }
        }
      } catch (err) {
        console.error('Failed to load ratings:', err);
      }

      // Calculate stats
      const today = new Date().toDateString();
      const todayDeliveries = deliveries.filter((d: any) => 
        new Date(d.created_at).toDateString() === today
      );
      
      const completedDeliveries = deliveries.filter((d: any) => d.status === 'delivered');

      setStats({
        todayOrders: todayDeliveries.length,
        totalEarnings: totalBalance,
        avgRating: avgRating,
        totalDeliveries: completedDeliveries.length,
      });

      // Recent deliveries (last 5)
      setRecentDeliveries(deliveries.slice(0, 5));

      // Earnings chart data from wallet transactions (last 7 days)
      try {
        const transactionsResponse = await walletApi.getTransactions();
        const transactions = transactionsResponse.transactions || [];
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const earningsMap = new Map();
        // Sum CREDIT transactions (earnings) by date
        transactions
          .filter((t: any) => t.type === 'CREDIT')
          .forEach((t: any) => {
            const date = new Date(t.created_at).toISOString().split('T')[0];
            if (last7Days.includes(date)) {
              earningsMap.set(date, (earningsMap.get(date) || 0) + parseFloat(t.amount));
            }
          });

        const chartData = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          earnings: earningsMap.get(date) || 0,
        }));

        setEarningsData(chartData);
      } catch (err) {
        console.error('Failed to load transactions for chart:', err);
        // Set empty chart data if transactions fail
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            earnings: 0,
          };
        });
        setEarningsData(last7Days);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your delivery overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Today's Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.todayOrders}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold mt-2">{Number(stats.totalEarnings).toLocaleString('vi-VN')}₫</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Avg. Rating</p>
                <p className="text-3xl font-bold mt-2">{stats.avgRating.toFixed(1)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Deliveries</p>
                <p className="text-3xl font-bold mt-2">{stats.totalDeliveries}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Earnings Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earnings" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 mr-3" />
                  <span className="text-gray-700 font-medium">Online Time Today</span>
                </div>
                <span className="text-orange-600 font-bold">8h 30m</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700 font-medium">Completion Rate</span>
                </div>
                <span className="text-green-600 font-bold">98%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700 font-medium">Distance Today</span>
                </div>
                <span className="text-blue-600 font-bold">42 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h3>
          {recentDeliveries.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDeliveries.map((delivery) => (
                    <tr key={delivery.delivery_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{delivery.delivery_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          delivery.status === 'delivered' 
                            ? 'bg-green-100 text-green-800'
                            : delivery.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(delivery.courier_fee).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent deliveries</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperDashboard;
