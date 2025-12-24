import { useState } from 'react';
import { Building2, Truck, X, Check } from 'lucide-react';
import { roleSwitchService } from '../../services/roleSwitchService';

export default function BecomePartner() {
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showShipperModal, setShowShipperModal] = useState(false);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h2>
      <p className="text-gray-600 mb-6">
        Expand your opportunities by joining our platform as a merchant or shipper
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Merchant Card */}
        <div className="border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Become a Merchant</h3>
          <p className="text-gray-600 mb-4">
            Open your shop and start selling on our platform
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Manage your products
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Track orders and deliveries
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Access merchant dashboard
            </li>
          </ul>
          <button
            onClick={() => setShowMerchantModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Register as Merchant
          </button>
        </div>

        {/* Shipper Card */}
        <div className="border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Become a Shipper</h3>
          <p className="text-gray-600 mb-4">
            Earn money by delivering packages
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Flexible working hours
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Competitive earnings
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Track your deliveries
            </li>
          </ul>
          <button
            onClick={() => setShowShipperModal(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Register as Shipper
          </button>
        </div>
      </div>

      {/* Merchant Registration Modal */}
      {showMerchantModal && (
        <MerchantRegistrationModal onClose={() => setShowMerchantModal(false)} />
      )}

      {/* Shipper Registration Modal */}
      {showShipperModal && (
        <ShipperRegistrationModal onClose={() => setShowShipperModal(false)} />
      )}
    </div>
  );
}

function MerchantRegistrationModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    business_license: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await roleSwitchService.registerAsMerchant(formData);
      alert('✅ Registration submitted successfully! Wait for admin approval. You will receive a notification when approved.');
      onClose();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Register as Merchant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Shop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Address
            </label>
            <textarea
              value={formData.shop_address}
              onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="123 Main Street, District 1, HCMC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Phone
            </label>
            <input
              type="tel"
              value={formData.shop_phone}
              onChange={(e) => setFormData({ ...formData, shop_phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business License Number
            </label>
            <input
              type="text"
              value={formData.business_license}
              onChange={(e) => setFormData({ ...formData, business_license: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShipperRegistrationModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    vehicle_type: 'bike',
    license_plate: '',
    id_card_number: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await roleSwitchService.registerAsShipper(formData);
      alert('✅ Registration submitted successfully! Wait for admin approval. You will receive a notification when approved.');
      onClose();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Register as Shipper</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type *
            </label>
            <select
              required
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="bike">Bike</option>
              <option value="motorbike">Motorbike</option>
              <option value="car">Car</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Plate
            </label>
            <input
              type="text"
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="29A-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Card Number *
            </label>
            <input
              type="text"
              required
              value={formData.id_card_number}
              onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="123456789012"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Your registration will be reviewed by admin. You'll receive a notification once approved.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
