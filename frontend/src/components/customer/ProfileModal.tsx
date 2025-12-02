import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/userApi';
import uploadApi from '../../services/uploadApi';

interface ProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userProfile: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onSuccess, userProfile }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    avatar: userProfile?.avatar || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await userApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
      });
      
      // Update user in context
      updateUser({
        fullName: formData.fullName,
        full_name: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
      });
      
      alert('Cập nhật profile thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ảnh không được vượt quá 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const avatarUrl = await uploadApi.uploadAvatar(file);
      setFormData({ ...formData, avatar: avatarUrl });
    } catch (err: any) {
      setError(err.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Cập nhật thông tin</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Đổi ảnh</span>
                  </>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Họ và tên</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </div>
            </label>
            <input
              type="email"
              value={userProfile?.email || user?.email || ''}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Số điện thoại</span>
              </div>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0901234567"
            />
          </div>

          {/* Member since */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Ngày tham gia</span>
              </div>
            </label>
            <input
              type="text"
              value={new Date().toLocaleDateString('vi-VN')}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
