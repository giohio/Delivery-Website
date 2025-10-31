import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  method: 'CASH' | 'BANK' | 'WALLET';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transaction_ref?: string;
  refunded: boolean;
  paid_at?: string;
  created_at: string;
}

export interface CreatePaymentRequest {
  amount: number;
  method: 'CASH' | 'BANK' | 'WALLET';
  transaction_ref?: string;
}

export const paymentApi = {
  // Create payment for order
  createPayment: async (orderId: number, data: CreatePaymentRequest) => {
    const response = await axios.post(
      `${API_BASE_URL}/payments/${orderId}`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Get payment for order
  getPayment: async (orderId: number) => {
    const response = await axios.get(`${API_BASE_URL}/payments/${orderId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Refund payment (admin only)
  refundPayment: async (orderId: number) => {
    const response = await axios.post(
      `${API_BASE_URL}/payments/${orderId}/refund`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
