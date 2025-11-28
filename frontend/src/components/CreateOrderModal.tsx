import React, { useState } from 'react';
import { X, MapPin, Package, CreditCard, Loader2 } from 'lucide-react';
import { customerApiService, CreateOrderRequest } from '../services/customerApi';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    from: '',
    to: '',
    items: '',
    notes: '',
    paymentMethod: 'cash'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.items) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await customerApiService.createOrder(formData);
      onOrderCreated();
      onClose();
      // Reset form
      setFormData({
        from: '',
        to: '',
        items: '',
        notes: '',
        paymentMethod: 'cash'
      });
    } catch (error) {
      setError('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Tạo đơn hàng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Địa chỉ lấy hàng *
            </label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              placeholder="Nhập địa chỉ lấy hàng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Địa chỉ giao hàng *
            </label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="Nhập địa chỉ giao hàng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Mô tả hàng hóa *
            </label>
            <textarea
              name="items"
              value={formData.items}
              onChange={handleChange}
              placeholder="Mô tả chi tiết hàng hóa cần giao"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú thêm
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú thêm cho tài xế (không bắt buộc)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Phương thức thanh toán
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ tín dụng</option>
              <option value="wallet">Ví điện tử</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                'Tạo đơn hàng'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
