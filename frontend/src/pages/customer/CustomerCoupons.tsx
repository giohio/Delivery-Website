import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Wallet,
  Gift,
  User,
  Tag,
  Calendar,
  Percent,
  Copy,
  Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { couponApi, Coupon } from '../../services/couponApi';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

const mockCoupons = [
  {
    id: 1,
    code: 'WELCOME20',
    title: '20% Off First Order',
    description: 'Get 20% discount on your first delivery',
    discount: 20,
    type: 'percentage',
    minOrder: 50000,
    maxDiscount: 30000,
    expiresAt: '2025-12-31',
    status: 'active',
  },
  {
    id: 2,
    code: 'FREESHIP',
    title: 'Free Shipping',
    description: 'Free delivery for orders above 100k',
    discount: 100,
    type: 'percentage',
    minOrder: 100000,
    maxDiscount: null,
    expiresAt: '2025-11-30',
    status: 'active',
  },
  {
    id: 3,
    code: 'SAVE50K',
    title: '50K Off',
    description: 'Flat 50,000 VND discount on any order',
    discount: 50000,
    type: 'fixed',
    minOrder: 200000,
    maxDiscount: null,
    expiresAt: '2025-12-15',
    status: 'active',
  },
  {
    id: 4,
    code: 'NEWUSER',
    title: 'New User Special',
    description: '30% off for new customers',
    discount: 30,
    type: 'percentage',
    minOrder: 0,
    maxDiscount: 50000,
    expiresAt: '2025-12-31',
    status: 'expired',
  },
];

export default function CustomerCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponApi.getAvailableCoupons();
      setCoupons(response.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getCouponColor = (status: string) => {
    return status === 'active'
      ? 'from-teal-500 to-cyan-600'
      : 'from-gray-400 to-gray-500';
  };

  const activeCoupons = coupons.filter(c => {
    const now = new Date();
    const validTo = new Date(c.valid_to);
    return c.is_active && validTo > now;
  });
  
  const expiredCoupons = coupons.filter(c => {
    const now = new Date();
    const validTo = new Date(c.valid_to);
    return !c.is_active || validTo <= now;
  });

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Coupons</h1>
        <p className="text-gray-600 mt-1">Save money on your next delivery</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No coupons available</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for amazing deals!</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Gift className="w-8 h-8" />
            <div>
              <p className="text-teal-100 text-sm">Available Coupons</p>
              <p className="text-3xl font-bold">{activeCoupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Saved</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(250000)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Used Coupons</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Coupons */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Coupons</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {activeCoupons.map((c) => (
            <div
              key={c.coupon_id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`bg-gradient-to-r ${getCouponColor(c.is_active ? 'active' : 'expired')} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{c.code}</h3>
                    <p className="text-sm text-white/80">{c.description}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}%`
                      : `${Number(c.discount_value).toLocaleString('vi-VN')}₫`}
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <Tag className="w-5 h-5" />
                  <span className="font-mono font-bold text-lg">{c.code}</span>
                  <button
                    onClick={() => handleCopyCode(c.code)}
                    className="ml-auto bg-white text-teal-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors flex items-center space-x-1"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min. Order:</span>
                  <span className="font-semibold text-gray-900">
                    {Number(c.min_order_value) > 0 
                      ? `${Number(c.min_order_value).toLocaleString('vi-VN')}₫` 
                      : 'No minimum'}
                  </span>
                </div>

                {c.max_discount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max. Discount:</span>
                    <span className="font-semibold text-gray-900">
                      {Number(c.max_discount).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Expires:</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date(c.valid_to).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-semibold">
                  Use This Coupon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expired Coupons */}
      {expiredCoupons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expired Coupons</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {expiredCoupons.map((c) => (
              <div
                key={c.coupon_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-60"
              >
                <div className={`bg-gradient-to-r ${getCouponColor('expired')} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{c.code}</h3>
                      <p className="text-sm text-white/80">{c.description}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      Expired
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <Tag className="w-5 h-5" />
                    <span className="font-mono font-bold text-lg">{c.code}</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-center text-gray-500">
                    This coupon expired on {new Date(c.valid_to).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* How to Use */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mt-8 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📱 How to Use Coupons</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Copy Code</h4>
            <p className="text-sm text-gray-600">Click "Copy" button to copy the coupon code</p>
          </div>
          <div>
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Order</h4>
            <p className="text-sm text-gray-600">Go to create order page and fill in details</p>
          </div>
          <div>
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Apply & Save</h4>
            <p className="text-sm text-gray-600">Paste code at checkout to get your discount</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
