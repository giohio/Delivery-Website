import React, { useState, useEffect } from 'react';
import { User, Package, Star, MapPin, Phone, Mail, FileText, Upload, Navigation, DollarSign } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { courierApi, CourierProfile } from '../../services/courierApi';

const ShipperProfile: React.FC = () => {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    operating_area: '',
    vehicle_type: 'motorbike' as 'motorbike' | 'car' | 'bicycle',
    license_plate: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  const menuItems = [
    { path: '/shipper/dashboard', label: 'Dashboard', icon: <Package /> },
    { path: '/shipper/deliveries', label: 'My Deliveries', icon: <Package /> },
    { path: '/shipper/available-orders', label: 'Available Orders', icon: <Navigation /> },
    { path: '/shipper/earnings', label: 'Earnings', icon: <DollarSign /> },
    { path: '/shipper/profile', label: 'Profile', icon: <User /> },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await courierApi.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        operating_area: data.operating_area || '',
        vehicle_type: data.vehicle_type || 'motorbike',
        license_plate: data.license_plate || '',
        bank_name: data.bank_name || '',
        account_number: data.account_number || '',
        account_name: data.account_name || '',
      });
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      // Set default empty profile if load fails
      setProfile({
        user_id: 0,
        email: '',
        full_name: '',
        phone: '',
        operating_area: '',
        vehicle_type: 'motorbike',
        license_plate: '',
        verification_status: 'pending'
      } as CourierProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courierApi.updateProfile(formData);
      await loadProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    }
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your courier profile and documents.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
              <p className="text-sm text-gray-600 mt-1">Your account verification status</p>
            </div>
            {profile && getVerificationBadge(profile.verification_status)}
          </div>
          {profile?.verification_status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your profile is under review. You'll be notified once your account is approved.
              </p>
            </div>
          )}
          {profile?.verification_status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Your profile was rejected. Please update your documents and contact support.
              </p>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Operating Area
                  </label>
                  <input
                    type="text"
                    value={formData.operating_area}
                    onChange={(e) => setFormData({ ...formData, operating_area: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="motorbike">Motorbike</option>
                    <option value="car">Car</option>
                    <option value="bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Bank Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 font-medium">{profile?.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Operating Area</p>
                  <p className="text-gray-900 font-medium">{profile?.operating_area || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="text-gray-900 font-medium capitalize">{profile?.vehicle_type || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="text-gray-900 font-medium">{profile?.license_plate || 'Not set'}</p>
                </div>
              </div>

              {(profile?.bank_name || profile?.account_number) && (
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Bank Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="text-gray-900 font-medium">{profile?.bank_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="text-gray-900 font-medium">{profile?.account_number || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Name</p>
                      <p className="text-gray-900 font-medium">{profile?.account_name || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">ID Card (Front)</p>
                {profile?.id_front_image ? (
                  <Star className="w-4 h-4 text-green-600" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {profile?.id_front_image ? (
                <img src={profile.id_front_image} alt="ID Front" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">ID Card (Back)</p>
                {profile?.id_back_image ? (
                  <Star className="w-4 h-4 text-green-600" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {profile?.id_back_image ? (
                <img src={profile.id_back_image} alt="ID Back" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Driver License</p>
                {profile?.license_image ? (
                  <Star className="w-4 h-4 text-green-600" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {profile?.license_image ? (
                <img src={profile.license_image} alt="License" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Vehicle Image</p>
                {profile?.vehicle_image ? (
                  <Star className="w-4 h-4 text-green-600" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {profile?.vehicle_image ? (
                <img src={profile.vehicle_image} alt="Vehicle" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperProfile;
