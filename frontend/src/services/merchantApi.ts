import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Customer {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

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

  // Get available orders (not assigned to any merchant)
  getAvailableOrders: async () => {
    const response = await axios.get(`${API_BASE_URL}/merchant/available-orders`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Accept an order (assign merchant to order)
  acceptOrder: async (orderId: number) => {
    const response = await axios.post(
      `${API_BASE_URL}/merchant/orders/${orderId}/accept`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
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

  // Search customers by name, email, or phone
  searchCustomers: async (query: string): Promise<{ ok: boolean; customers: Customer[] }> => {
    const response = await axios.get(`${API_BASE_URL}/merchant/customers/search`, {
      headers: getAuthHeader(),
      params: { q: query },
    });
    return response.data;
  },
};
