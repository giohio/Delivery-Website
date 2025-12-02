import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Wallet,
  Gift,
  User,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { orderApi } from '../../services/orderApi';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      const orders = response.orders || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
        completedOrders: orders.filter((o: any) => o.status === 'COMPLETED').length,
        totalSpent: orders.reduce((sum: number, o: any) => sum + (Number(o.price_estimate) || 0), 0),
      });

      setRecentOrders(orders.slice(0, 5));

      const last6Months = generateMonthlyData(orders);
      setSpendingData(last6Months);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (orders: any[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      
      const monthOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at);
        return orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth();
      });

      data.push({
        month: monthNames[date.getMonth()],
        amount: monthOrders.reduce((sum: number, o: any) => sum + (Number(o.price_estimate) || 0), 0),
        orders: monthOrders.length
      });
    }

    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back 👋</h1>
        <p className="text-gray-500">Track your deliveries and manage orders from your dashboard</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        <motion.div
          variants={item}
          className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.totalOrders}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.pendingOrders}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.completedOrders}</p>
        </motion.div>

        <motion.div
          variants={item}
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl hover:shadow-blue-200 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-sm font-medium text-blue-100 mb-1">Total Spent</p>
          <p className="text-2xl font-semibold">{formatCurrency(stats.totalSpent)}</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
              <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <span className="text-gray-600">Amount</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Spent']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Activity</h3>
          <div className="space-y-4">
            {spendingData.slice(-3).reverse().map((month, idx) => (
              <div key={month.month} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{month.month}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{month.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(month.amount)}</p>
                  <p className={`text-xs mt-0.5 ${idx === 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {idx === 0 ? '+8.2%' : idx === 1 ? '+5.1%' : '+3.4%'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden mb-8"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500 mt-0.5">Track your latest deliveries</p>
          </div>
          <button
            onClick={() => navigate('/customer/orders')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Loading orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No orders yet</p>
              <p className="text-gray-500 text-sm">Create your first delivery order to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order, idx) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/customer/track-order?id=${order.order_id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-gray-900">#{order.order_id}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-600 truncate flex-1">{order.pickup_address}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-gray-600 truncate flex-1">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        {formatCurrency(order.price_estimate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/create-order')}
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 overflow-hidden hover:shadow-xl hover:shadow-blue-200 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Create New Order</h3>
            <p className="text-sm text-blue-100">Start a new delivery request</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/track-order')}
          className="group relative bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl p-6 overflow-hidden hover:shadow-xl hover:shadow-teal-200 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Track Order</h3>
            <p className="text-sm text-teal-100">Real-time delivery tracking</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/customer/coupons')}
          className="group relative bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6 overflow-hidden hover:shadow-xl hover:shadow-purple-200 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">My Coupons</h3>
            <p className="text-sm text-purple-100">Save money on deliveries</p>
          </div>
        </motion.button>
      </div>
    </DashboardLayout>
  );
}
