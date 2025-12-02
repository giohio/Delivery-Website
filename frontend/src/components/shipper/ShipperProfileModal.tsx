import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Bike, FileText, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courierApi, CourierProfile } from '../../services/courierApi';
import uploadApi from '../../services/uploadApi';
import ImageUploader from '../common/ImageUploader';

interface ShipperProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ShipperProfileModal: React.FC<ShipperProfileModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'kyc' | 'bank'>('personal');
  
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    operatingArea: '',
    
    // KYC Documents
    idNumber: '',
    idFrontImage: '',
    idBackImage: '',
    driverLicense: '',
    licenseImage: '',
    
    // Vehicle Info
    vehicleType: 'motorbike',
    licensePlate: '',
    vehicleImage: '',
    
    // Bank Account
    bankName: '',
    accountNumber: '',
    accountName: '',
    
    // Verification Status
    verificationStatus: 'pending' // pending | approved | rejected
  });

  useEffect(() => {
    loadShipperProfile();
  }, []);

  const loadShipperProfile = async () => {
    try {
      const profile: CourierProfile = await courierApi.getProfile();
      setFormData({
        ...formData,
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        operatingArea: profile.operating_area || '',
        idNumber: profile.id_number || '',
        idFrontImage: profile.id_front_image || '',
        idBackImage: profile.id_back_image || '',
        driverLicense: profile.driver_license || '',
        licenseImage: profile.license_image || '',
        vehicleType: profile.vehicle_type || 'motorbike',
        licensePlate: profile.license_plate || '',
        vehicleImage: profile.vehicle_image || '',
        bankName: profile.bank_name || '',
        accountNumber: profile.account_number || '',
        accountName: profile.account_name || '',
        verificationStatus: profile.verification_status || 'pending',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await courierApi.updateProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        operating_area: formData.operatingArea,
        id_number: formData.idNumber,
        id_front_image: formData.idFrontImage,
        id_back_image: formData.idBackImage,
        driver_license: formData.driverLicense,
        license_image: formData.licenseImage,
        vehicle_type: formData.vehicleType as 'motorbike' | 'car' | 'bicycle',
        license_plate: formData.licensePlate,
        vehicle_image: formData.vehicleImage,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
      });
      
      alert('Cập nhật hồ sơ thành công! Đang chờ admin duyệt.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCUpload = async (file: File, field: string): Promise<string> => {
    try {
      const fileUrl = await uploadApi.uploadKYC(file);
      setFormData(prev => ({ ...prev, [field]: fileUrl }));
      return fileUrl;
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      throw error;
    }
  };

  const renderPersonalTab = () => (
    <div className="space-y-4">
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
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

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
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Khu vực hoạt động</span>
          </div>
        </label>
        <input
          type="text"
          value={formData.operatingArea}
          onChange={(e) => setFormData({ ...formData, operatingArea: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Quận 1, TPHCM"
        />
      </div>
    </div>
  );

  const renderKYCTab = () => (
    <div className="space-y-4">
      {/* ID Card */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Số CCCD/CMND</span>
          </div>
        </label>
        <input
          type="text"
          value={formData.idNumber}
          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="001234567890"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageUploader
          label="Ảnh mặt trước CCCD"
          currentImage={formData.idFrontImage}
          onUpload={(file) => handleKYCUpload(file, 'idFrontImage')}
          aspectRatio="3/2"
        />
        <ImageUploader
          label="Ảnh mặt sau CCCD"
          currentImage={formData.idBackImage}
          onUpload={(file) => handleKYCUpload(file, 'idBackImage')}
          aspectRatio="3/2"
        />
      </div>

      {/* Driver License */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Số bằng lái xe</span>
          </div>
        </label>
        <input
          type="text"
          value={formData.driverLicense}
          onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="A1-123456789"
        />
      </div>

      <ImageUploader
        label="Ảnh bằng lái"
        currentImage={formData.licenseImage}
        onUpload={(file) => handleKYCUpload(file, 'licenseImage')}
        aspectRatio="3/2"
      />

      {/* Vehicle Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <Bike className="w-4 h-4" />
            <span>Loại phương tiện</span>
          </div>
        </label>
        <select
          value={formData.vehicleType}
          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="motorbike">Xe máy</option>
          <option value="car">Ô tô</option>
          <option value="bicycle">Xe đạp</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Biển số xe</label>
        <input
          type="text"
          value={formData.licensePlate}
          onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="59-A1 12345"
        />
      </div>

      <ImageUploader
        label="Ảnh phương tiện"
        currentImage={formData.vehicleImage}
        onUpload={(file) => handleKYCUpload(file, 'vehicleImage')}
        aspectRatio="4/3"
      />
    </div>
  );

  const renderBankTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">💳 Tài khoản nhận tiền</p>
        <p className="text-xs">Tài khoản này sẽ được dùng để nhận tiền từ các đơn hàng đã hoàn thành.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Ngân hàng</span>
          </div>
        </label>
        <select
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn ngân hàng --</option>
          <option value="Vietcombank">Vietcombank</option>
          <option value="Techcombank">Techcombank</option>
          <option value="VietinBank">VietinBank</option>
          <option value="BIDV">BIDV</option>
          <option value="Agribank">Agribank</option>
          <option value="MB Bank">MB Bank</option>
          <option value="ACB">ACB</option>
          <option value="VPBank">VPBank</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
        <input
          type="text"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="0123456789"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ tài khoản</label>
        <input
          type="text"
          value={formData.accountName}
          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="NGUYEN VAN A"
        />
      </div>
    </div>
  );

  const getStatusBadge = () => {
    const status = formData.verificationStatus;
    if (status === 'approved') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Đã xác minh</span>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Bị từ chối</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Chờ duyệt</span>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">Hồ sơ Shipper</h3>
              <div className="mt-2">
                {getStatusBadge()}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'kyc'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              KYC & Phương tiện
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'bank'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tài khoản ngân hàng
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'kyc' && renderKYCTab()}
            {activeTab === 'bank' && renderBankTab()}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
