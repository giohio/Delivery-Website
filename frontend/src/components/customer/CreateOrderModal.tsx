import React, { useState } from 'react';
import { X, MapPin, Navigation, CreditCard } from 'lucide-react';
import { orderApi, CreateOrderRequest } from '../../services/orderApi';

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess: (orderData?: any) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    pickup_address: '',
    delivery_address: '',
    distance_km: 0,
    price_estimate: 0,
    payment_method: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateEstimate = () => {
    // Simple calculation: 5000 VND per km + 10000 VND base fee
    const distance = formData.distance_km || 0;
    const estimate = Math.round(distance * 5000 + 10000);
    setFormData({ ...formData, price_estimate: estimate });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickup_address || !formData.delivery_address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating order with data:', formData);
      const response = await orderApi.createOrder(formData);
      console.log('Order created successfully:', response);
      
      // Pass the created order data back to parent
      onSuccess({
        ...formData,
        orderId: response.order?.order_id || Date.now(),
        createdOrder: response.order
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to create order';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure backend is running at http://localhost:5000';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please logout and login again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create New Order</h3>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Pickup Address *
            </label>
            <input
              type="text"
              required
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main St, District 1, Ho Chi Minh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Navigation className="w-4 h-4 inline mr-1" />
              Delivery Address *
            </label>
            <input
              type="text"
              required
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="456 Second Ave, District 3, Ho Chi Minh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.distance_km || ''}
              onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })}
              onBlur={calculateEstimate}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Estimate (VND)
            </label>
            <input
              type="number"
              value={formData.price_estimate || ''}
              onChange={(e) => setFormData({ ...formData, price_estimate: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auto-calculated"
            />
            <p className="text-xs text-gray-500 mt-1">
              Calculated: {formData.distance_km ? Math.round(formData.distance_km * 5000 + 10000).toLocaleString() : 0} VND
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Payment Method *
            </label>
            <select
              value={formData.payment_method || 'cash'}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
