import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, CreditCard, Package, Truck, ShoppingBag } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi } from '../../services/merchantApi';

interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  method: string;
  status: string;
  paid_at?: string;
  created_at?: string;
}

export default function MerchantPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package className="w-5 h-5" />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await merchantApi.getMerchantPayments();
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true;
    return payment.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const totalAmount = payments
    .filter(p => p.status.toLowerCase() === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status.toLowerCase() === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      success: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Success' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
    };

    const config = statusConfig[statusLower] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method.toLowerCase();
    
    const methodConfig: Record<string, { color: string; label: string }> = {
      cash: { color: 'bg-gray-100 text-gray-800', label: 'Cash' },
      card: { color: 'bg-blue-100 text-blue-800', label: 'Card' },
      wallet: { color: 'bg-purple-100 text-purple-800', label: 'Wallet' },
      bank_transfer: { color: 'bg-indigo-100 text-indigo-800', label: 'Bank Transfer' },
    };

    const config = methodConfig[methodLower] || { color: 'bg-gray-100 text-gray-800', label: method };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        <CreditCard className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage your payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="text-green-100 text-sm">Total Revenue</div>
            <div className="text-2xl font-bold mt-1">{(totalAmount / 1000).toFixed(0)}K₫</div>
            <div className="text-green-100 text-xs mt-1">
              {payments.filter(p => p.status.toLowerCase() === 'success').length} transactions
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-yellow-100 text-sm">Pending</div>
            <div className="text-2xl font-bold mt-1">{(pendingAmount / 1000).toFixed(0)}K₫</div>
            <div className="text-yellow-100 text-xs mt-1">
              {payments.filter(p => p.status.toLowerCase() === 'pending').length} transactions
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">Total Transactions</div>
            <div className="text-2xl font-bold mt-1">{payments.length}</div>
            <div className="text-blue-100 text-xs mt-1">All time</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-red-100 text-sm">Failed</div>
            <div className="text-2xl font-bold mt-1">
              {payments.filter(p => p.status.toLowerCase() === 'failed').length}
            </div>
            <div className="text-red-100 text-xs mt-1">Transactions</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Payment ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p>No payments found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.payment_id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">#{payment.payment_id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">Order #{payment.order_id}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getPaymentMethodBadge(payment.method)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="font-semibold text-gray-900">
                            {payment.amount.toLocaleString('vi-VN')}₫
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {payment.paid_at 
                              ? new Date(payment.paid_at).toLocaleString('vi-VN')
                              : payment.created_at 
                                ? new Date(payment.created_at).toLocaleString('vi-VN')
                                : 'N/A'
                            }
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Methods Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
            Accepted Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="font-medium text-gray-900">Cash</div>
              <div className="text-gray-600 text-xs mt-1">Pay on delivery</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="font-medium text-gray-900">Card</div>
              <div className="text-gray-600 text-xs mt-1">Credit/Debit cards</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="font-medium text-gray-900">Wallet</div>
              <div className="text-gray-600 text-xs mt-1">Digital wallets</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="font-medium text-gray-900">Bank Transfer</div>
              <div className="text-gray-600 text-xs mt-1">Direct transfer</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
