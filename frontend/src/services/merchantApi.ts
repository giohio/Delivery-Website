import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CreateMerchantOrderRequest {
  customer_id: number;
  pickup_address: string;
  delivery_address: string;
  distance_km?: number;
  price_estimate?: number;
}

export const merchantApi = {
  // Create order for customer (merchant only)
  createOrderForCustomer: async (data: CreateMerchantOrderRequest) => {
    const response = await axios.post(`${API_BASE_URL}/merchant/orders`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get merchant's orders
  getMerchantOrders: async () => {
    const response = await axios.get(`${API_BASE_URL}/merchant/orders`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get merchant's deliveries
  getMerchantDeliveries: async () => {
    const response = await axios.get(`${API_BASE_URL}/merchant/deliveries`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get merchant's payments
  getMerchantPayments: async () => {
    const response = await axios.get(`${API_BASE_URL}/merchant/payments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
