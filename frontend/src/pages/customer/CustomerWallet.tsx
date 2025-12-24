import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Wallet,
  Gift,
  User,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { walletApi } from '../../services/walletApi';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('100000');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found - user not logged in');
        alert('Please login to view your wallet');
        window.location.href = '/login';
        return;
      }
      
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions(),
      ]);
      
      setBalance(walletResponse.balance || 0);
      setTransactions(transactionsResponse.transactions || []);

      const last7Days = generateLast7DaysTrend(transactionsResponse.transactions || []);
      setTrendData(last7Days);
    } catch (error: any) {
      console.error('Error loading wallet:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        alert('Session expired. Please login again.');
        sessionStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLast7DaysTrend = (txs: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayTxs = txs.filter((tx: any) => {
        const txDate = new Date(tx.created_at);
        return txDate.toDateString() === date.toDateString();
      });

      const dayBalance = dayTxs.reduce((sum: number, tx: any) => {
        return sum + (tx.type === 'credit' ? tx.amount : -tx.amount);
      }, 0);

      data.push({
        date: dayName,
        balance: Math.abs(dayBalance)
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

  const totalSpent = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTopup = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate VietQR URL
  const generateQRUrl = (amount: number) => {
    const bankId = 'VCB'; // Vietcombank
    const accountNo = '1025996717'; // Số tài khoản Vietcombank
    const accountName = 'FASTSHIP';
    const memo = transactionRef || `NAPVI${Date.now()}`; // Use transaction ref for tracking
    
    // VietQR API v2 format (ổn định hơn)
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.jpg?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;
  };

  const handleTopUp = () => {
    // Generate unique transaction ref for tracking
    const ref = `NAPVI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setTransactionRef(ref);
    setTopUpAmount(0); // Reset amount when opening modal
    setShowTopUpModal(true);
  };

  const handleVerifyPayment = async () => {
    try {
      setVerifying(true);
      const amount = parseInt(topUpAmount) || 0;
      
      if (amount < 10000) {
        alert('Minimum top up amount is 10,000₫');
        setVerifying(false);
        return;
      }
      
      if (!transactionRef) {
        alert('Transaction reference is missing. Please try again.');
        setVerifying(false);
        return;
      }
      
      console.log('Verifying payment:', { transactionRef, amount }); // Debug log
      
      const response = await walletApi.verifyPayment(transactionRef, amount);
      
      if (response?.data?.ok) {
        // Check if already processed
        if (response.data.already_processed) {
          alert(`✅ Payment Already Verified!\n\nThis payment was already processed successfully.\nAmount: ${Number(response.data.amount).toLocaleString('vi-VN')}₫\nCurrent balance: ${Number(response.data.current_balance).toLocaleString('vi-VN')}₫`);
        } else {
          alert(`✅ Payment Verified Successfully!\n\nNew balance: ${Number(response.data.new_balance).toLocaleString('vi-VN')}₫`);
        }
        setShowTopUpModal(false);
        setTopUpAmount(0);
        setTransactionRef('');
        await loadWallet(); // Reload wallet data
      } else {
        alert(response?.data?.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to verify payment. Please try again or contact support.';
      alert(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-1">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-teal-100 text-sm mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold">{formatCurrency(balance)}</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <Wallet className="w-12 h-12" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleTopUp}
            className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Top Up</span>
          </button>
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Top-up</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTopup)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">-8%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">This month</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Balance Trend</h3>
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center space-x-1">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="balance" stroke="#14b8a6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            Export →
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'CREDIT'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'CREDIT' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'CREDIT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Top Up Wallet</h3>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                    placeholder="100,000"
                    min="10000"
                  />
                  <span className="absolute right-4 top-3 text-gray-500 text-lg">₫</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount.toString())}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        parseInt(topUpAmount) === amount
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                    >
                      {(amount / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Scan QR Code to Pay</h4>
                  <p className="text-sm text-gray-600">
                    Use your banking app to scan this QR code
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 flex justify-center">
                  <img
                    src={generateQRUrl(parseInt(topUpAmount) || 100000)}
                    alt="VietQR Payment"
                    className="w-64 h-64 object-contain"
                    onError={(e) => {
                      // Fallback nếu QR không load được
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                        `Bank: Vietcombank\nAccount: 1025996717\nAmount: ${Number(topUpAmount).toLocaleString('vi-VN')}₫\nContent: Top up wallet`
                      )}`;
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-semibold text-gray-900">Vietcombank (VCB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-semibold text-gray-900">1025996717</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold text-gray-900">FASTSHIP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-teal-600 text-lg">
                      {Number(topUpAmount).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="pt-2 border-t border-teal-200">
                    <p className="text-xs text-gray-500">
                      Transfer content: <span className="font-mono text-gray-700 font-semibold">{transactionRef}</span>
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Important: Include this code in transfer memo to auto-verify
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                  📱 How to Top Up
                </h5>
                <ol className="text-xs text-blue-900 space-y-1 ml-5 list-decimal">
                  <li>Open banking app (Momo, ZaloPay, Bank app)</li>
                  <li>Select Scan QR or Transfer</li>
                  <li>Scan the QR code above</li>
                  <li>Confirm the amount and transfer</li>
                  <li>Balance updates in 1-2 minutes</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTopUpModal(false);
                    setTopUpAmount(0);
                    setTransactionRef('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  disabled={verifying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifying || !topUpAmount || parseInt(topUpAmount) < 10000}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "I've Paid - Verify Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
