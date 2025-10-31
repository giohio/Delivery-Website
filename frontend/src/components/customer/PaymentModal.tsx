import React, { useState } from 'react';
import { X, CreditCard, Wallet, DollarSign } from 'lucide-react';
import { paymentApi, CreatePaymentRequest } from '../../services/paymentApi';

interface PaymentModalProps {
  orderId: number;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ orderId, amount, onClose, onSuccess }) => {
  const [paymentData, setPaymentData] = useState<CreatePaymentRequest>({
    amount,
    method: 'CASH',
    transaction_ref: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentApi.createPayment(orderId, paymentData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Payment Method</h3>
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Order #{orderId}</p>
            <p className="text-2xl font-bold text-blue-600">
              {amount.toLocaleString()} VND
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentData({ ...paymentData, method: 'CASH' })}
                className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition ${
                  paymentData.method === 'CASH'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-6 h-6 text-green-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive</p>
                </div>
                {paymentData.method === 'CASH' && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentData({ ...paymentData, method: 'BANK' })}
                className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition ${
                  paymentData.method === 'BANK'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-gray-500">Pay now via bank</p>
                </div>
                {paymentData.method === 'BANK' && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentData({ ...paymentData, method: 'WALLET' })}
                className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition ${
                  paymentData.method === 'WALLET'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="w-6 h-6 text-purple-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">E-Wallet</p>
                  <p className="text-xs text-gray-500">Pay with digital wallet</p>
                </div>
                {paymentData.method === 'WALLET' && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {(paymentData.method === 'BANK' || paymentData.method === 'WALLET') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentData.transaction_ref}
                onChange={(e) => setPaymentData({ ...paymentData, transaction_ref: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter transaction ID"
              />
            </div>
          )}

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
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
