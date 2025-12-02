import React, { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, Calendar, Clock, Download, Navigation } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { deliveryApi } from '../../services/deliveryApi';
import { walletApi } from '../../services/walletApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  transaction_id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  delivery_id?: number;
}

const ShipperEarnings: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    avgPerDelivery: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const menuItems = [
    { path: '/shipper/dashboard', label: 'Dashboard', icon: <Package /> },
    { path: '/shipper/deliveries', label: 'My Deliveries', icon: <Package /> },
    { path: '/shipper/available-orders', label: 'Available Orders', icon: <Navigation /> },
    { path: '/shipper/earnings', label: 'Earnings', icon: <DollarSign /> },
    { path: '/shipper/profile', label: 'Profile', icon: <Package /> },
  ];

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // Load wallet balance
      try {
        const walletResponse = await walletApi.getWallet();
        setBalance(walletResponse.wallet?.balance || 0);
      } catch (err) {
        console.error('Failed to load wallet:', err);
        setBalance(0);
      }
      
      // Load transactions
      const transactionsResponse = await walletApi.getTransactions();
      const allTransactions = transactionsResponse.transactions || [];
      setTransactions(allTransactions);

      // Load deliveries for stats
      const deliveriesResponse = await deliveryApi.getMyDeliveries();
      const deliveries = deliveriesResponse.deliveries || [];
      const completedDeliveries = deliveries.filter((d: any) => d.status === 'delivered');

      // Calculate stats
      const totalEarnings = completedDeliveries.reduce((sum: number, d: any) => sum + (d.courier_fee || 0), 0);
      
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthEarnings = completedDeliveries
        .filter((d: any) => new Date(d.created_at) >= thisMonthStart)
        .reduce((sum: number, d: any) => sum + (d.courier_fee || 0), 0);

      const lastMonthEarnings = completedDeliveries
        .filter((d: any) => {
          const date = new Date(d.created_at);
          return date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum: number, d: any) => sum + (d.courier_fee || 0), 0);

      const avgPerDelivery = completedDeliveries.length > 0 
        ? totalEarnings / completedDeliveries.length 
        : 0;

      setStats({
        totalEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        avgPerDelivery,
      });

      // Earnings chart data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const earningsMap = new Map();
      completedDeliveries.forEach((d: any) => {
        const date = new Date(d.created_at).toISOString().split('T')[0];
        if (last30Days.includes(date)) {
          earningsMap.set(date, (earningsMap.get(date) || 0) + (d.courier_fee || 0));
        }
      });

      const chartData = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: earningsMap.get(date) || 0,
      }));

      setEarningsData(chartData);
    } catch (err) {
      console.error('Failed to load earnings data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'credit') return t.type === 'credit' || t.amount > 0;
    if (filter === 'debit') return t.type === 'debit' || t.amount < 0;
    return true;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600 mt-1">Track your income and transaction history.</p>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold mt-2">{Number(balance).toLocaleString('vi-VN')}₫</p>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold mt-2">{Number(stats.thisMonth).toLocaleString('vi-VN')}₫</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Last Month</p>
                <p className="text-3xl font-bold mt-2">{Number(stats.lastMonth).toLocaleString('vi-VN')}₫</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Avg. Per Delivery</p>
                <p className="text-3xl font-bold mt-2">{Number(stats.avgPerDelivery).toLocaleString('vi-VN')}₫</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Earnings Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <div className="flex gap-2">
              {['all', 'credit', 'debit'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.amount > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.amount > 0 ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{Number(transaction.amount).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperEarnings;
