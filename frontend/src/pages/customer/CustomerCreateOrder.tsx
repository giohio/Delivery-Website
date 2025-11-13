import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Wallet,
  Gift,
  User,
} from 'lucide-react';
import { CreateOrderModal } from '../../components/customer/CreateOrderModal';
import { useState } from 'react';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/create-order', icon: <PlusCircle />, label: 'Create Order' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerCreateOrder() {
  const [showModal, setShowModal] = useState(true);

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-600 mt-1">Schedule a delivery with real-time pricing</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-8 mb-6 border border-teal-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 Quick Delivery Service</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900">Enter Addresses</h3>
            </div>
            <p className="text-sm text-gray-600">Pickup and delivery locations with map preview</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900">Get Price</h3>
            </div>
            <p className="text-sm text-gray-600">Instant pricing based on distance and weather</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900">Confirm Order</h3>
            </div>
            <p className="text-sm text-gray-600">Choose payment method and track delivery</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">✨ Features</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Real-time GPS tracking</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Weather-based dynamic pricing</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Multiple payment methods</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Professional couriers</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">💰 Pricing</h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Base fare:</span>
              <span className="font-semibold">15,000 VND</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Per km:</span>
              <span className="font-semibold">5,000 VND</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Rain surcharge:</span>
              <span className="font-semibold">+20%</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Heavy rain:</span>
              <span className="font-semibold">+50%</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Create Order Button */}
      <div className="text-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-shadow inline-flex items-center space-x-3"
        >
          <PlusCircle className="w-6 h-6" />
          <span>Open Order Form</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateOrderModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            window.location.href = '/customer/orders';
          }}
        />
      )}
    </DashboardLayout>
  );
}
