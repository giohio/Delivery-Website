import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Wallet,
  Gift,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/userApi';
import { ProfileModal } from '../../components/customer/ProfileModal';
import { ChangePasswordModal } from '../../components/customer/ChangePasswordModal';
import ImageUploader from '../../components/common/ImageUploader';
import uploadApi from '../../services/uploadApi';

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerProfile() {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await userApi.getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      const avatarUrl = await uploadApi.uploadAvatar(file);
      // Update user profile with new avatar
      await userApi.updateProfile({ 
        fullName: userProfile?.full_name || '',
        phone: userProfile?.phone || undefined,
        avatar: avatarUrl 
      });
      await loadProfile();
      setShowAvatarUpload(false);
      alert('Cập nhật ảnh đại diện thành công!');
      return avatarUrl;
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      alert('Upload ảnh thất bại: ' + (error.message || 'Unknown error'));
      throw error;
    }
  };

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="relative h-32 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-xl">
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                      {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="absolute bottom-0 right-0 bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 shadow-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-20 px-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userProfile?.full_name || 'User Name'}
                  </h2>
                  <p className="text-gray-600">{userProfile?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                    Customer
                  </span>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900">{userProfile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-gray-900">{userProfile?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Member Since</p>
                    <p className="text-gray-900">
                      {userProfile?.created_at 
                        ? new Date(userProfile.created_at).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Role</p>
                    <p className="text-gray-900 capitalize">{userProfile?.role || 'Customer'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Personal Information</p>
                      <p className="text-sm text-gray-600">Update your name and phone</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-600">Update your password</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Saved Addresses</p>
                      <p className="text-sm text-gray-600">Manage delivery addresses</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">SMS Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Promotional Offers</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
            loadProfile();
          }}
          userProfile={userProfile}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
        />
      )}
      
      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Avatar</h3>
              <button
                onClick={() => setShowAvatarUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <ImageUploader
              label="Profile Picture"
              currentImage={userProfile?.avatar}
              onUpload={handleAvatarUpload}
              aspectRatio="1/1"
              maxSizeMB={2}
            />
            <button
              onClick={() => setShowAvatarUpload(false)}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
