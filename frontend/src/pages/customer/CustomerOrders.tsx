import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Wallet,
  Gift,
  User,
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  Star,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderApi } from '../../services/orderApi';
import { CreateOrderModal } from '../../components/customer/CreateOrderModal';
import { PaymentModal } from '../../components/customer/PaymentModal';
import { RatingModal } from '../../components/customer/RatingModal';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    ongoing: 0,
    completed: 0,
    canceled: 0,
    totalSpent: 0,
    totalDistance: 0,
    walletPayments: 0,
    cashPayments: 0
  });
  
  // Modals
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      const ordersData = response.orders || [];
      setOrders(ordersData);
      
      // Calculate statistics
      const statistics = {
        totalOrders: ordersData.length,
        pending: ordersData.filter((o: any) => o.status === 'PENDING').length,
        ongoing: ordersData.filter((o: any) => o.status === 'ONGOING' || o.status === 'ASSIGNED').length,
        completed: ordersData.filter((o: any) => o.status === 'COMPLETED').length,
        canceled: ordersData.filter((o: any) => o.status === 'CANCELED').length,
        totalSpent: ordersData
          .filter((o: any) => o.status === 'COMPLETED')
          .reduce((sum: number, o: any) => sum + (Number(o.price_estimate) || 0), 0),
        totalDistance: ordersData
          .reduce((sum: number, o: any) => sum + (Number(o.distance_km) || 0), 0),
        walletPayments: ordersData.filter((o: any) => o.payment_method === 'wallet').length,
        cashPayments: ordersData.filter((o: any) => o.payment_method === 'cash').length
      };
      setStats(statistics);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const searchNum = searchTerm.trim();
      
      filtered = filtered.filter(order => {
        // Check if search term is a number (for exact ID match)
        if (/^\d+$/.test(searchNum)) {
          // Exact match for order ID
          return order.order_id.toString() === searchNum;
        }
        
        // Text search in addresses
        return order.pickup_address?.toLowerCase().includes(searchLower) ||
               order.delivery_address?.toLowerCase().includes(searchLower);
      });
    }

    setFilteredOrders(filtered);
  };

  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Order ID',
        'Status',
        'Pickup Address',
        'Delivery Address',
        'Distance (km)',
        'Price (VND)',
        'Payment Method',
        'Service Type',
        'Package Size',
        'Created At',
        'Completed At'
      ];

      // Prepare CSV rows
      const rows = filteredOrders.map(order => [
        order.order_id,
        order.status,
        order.pickup_address,
        order.delivery_address,
        order.distance_km || 0,
        order.price_estimate || 0,
        order.payment_method || 'N/A',
        order.service_type || 'N/A',
        order.package_size || 'N/A',
        order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'N/A',
        order.completed_at ? new Date(order.completed_at).toLocaleString('vi-VN') : 'N/A'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${filteredOrders.length} orders to CSV successfully!`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderApi.cancelOrder(orderId);
      alert('Order cancelled successfully');
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const handlePayOrder = (order: any) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleRateOrder = (order: any) => {
    setSelectedOrder(order);
    setShowRatingModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
      ONGOING: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: '🕐 Pending',
      ASSIGNED: '📦 Assigned',
      ONGOING: '🚚 In Transit',
      COMPLETED: '✅ Completed',
      CANCELED: '❌ Canceled',
    };
    return badges[status] || status;
  };

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage all your deliveries</p>
          </div>
          <button
            onClick={() => setShowCreateOrderModal(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ONGOING">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Export Button */}
          <button 
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              <div className="flex items-center space-x-2 mt-3 text-sm">
                <span className="bg-blue-400/30 px-2 py-0.5 rounded">✓ {stats.completed}</span>
                <span className="bg-blue-400/30 px-2 py-0.5 rounded">⏳ {stats.ongoing}</span>
                <span className="bg-blue-400/30 px-2 py-0.5 rounded">⚠ {stats.pending}</span>
              </div>
            </div>
            <Package className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-emerald-100 text-xs mt-3">From {stats.completed} completed orders</p>
            </div>
            <Wallet className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Distance</p>
              <p className="text-3xl font-bold mt-2">{stats.totalDistance.toFixed(1)} km</p>
              <p className="text-purple-100 text-xs mt-3">Across all deliveries</p>
            </div>
            <MapPin className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Payment Split</p>
              <div className="flex items-center space-x-3 mt-2">
                <div>
                  <p className="text-2xl font-bold">{stats.walletPayments}</p>
                  <p className="text-orange-100 text-xs">Wallet</p>
                </div>
                <div className="text-orange-200 text-2xl">/</div>
                <div>
                  <p className="text-2xl font-bold">{stats.cashPayments}</p>
                  <p className="text-orange-100 text-xs">Cash</p>
                </div>
              </div>
            </div>
            <CreditCard className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Quick Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { status: 'ALL', label: 'All Orders', count: stats.totalOrders, color: 'gray' },
            { status: 'PENDING', label: 'Pending', count: stats.pending, color: 'yellow' },
            { status: 'ONGOING', label: 'In Transit', count: stats.ongoing, color: 'blue' },
            { status: 'COMPLETED', label: 'Completed', count: stats.completed, color: 'green' },
            { status: 'CANCELED', label: 'Canceled', count: stats.canceled, color: 'red' }
          ].map((item) => (
            <button
              key={item.status}
              onClick={() => setStatusFilter(item.status)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                statusFilter === item.status
                  ? `border-${item.color}-500 bg-${item.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`text-lg font-bold ${
                statusFilter === item.status ? `text-${item.color}-600` : 'text-gray-900'
              }`}>{item.count}</span>
              <span className="text-sm text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or create a new order</p>
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              Create First Order
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div key={order.order_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-100 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusBadge(order.status)}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatCurrency(order.price_estimate)}
                    </p>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                      <p className="text-sm text-gray-900">{order.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">DELIVERY</p>
                      <p className="text-sm text-gray-900">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/customer/track-order?id=${order.order_id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Track</span>
                  </button>

                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handlePayOrder(order)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.order_id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {order.status === 'COMPLETED' && order.delivery_id && (
                    <button
                      onClick={() => handleRateOrder(order)}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateOrderModal && (
        <CreateOrderModal
          onClose={() => setShowCreateOrderModal(false)}
          onSuccess={() => {
            setShowCreateOrderModal(false);
            loadOrders();
          }}
        />
      )}

      {showPaymentModal && selectedOrder && (
        <PaymentModal
          orderId={selectedOrder.order_id}
          amount={selectedOrder.price_estimate}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadOrders();
          }}
        />
      )}

      {showRatingModal && selectedOrder && (
        <RatingModal
          deliveryId={selectedOrder.delivery_id}
          onClose={() => setShowRatingModal(false)}
          onSuccess={() => {
            setShowRatingModal(false);
            loadOrders();
          }}
        />
      )}
    </DashboardLayout>
  );
}
