import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Order {
  order_id: number;
  customer_id: number;
  merchant_id?: number;
  pickup_address: string;
  delivery_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
  status: string;
  distance_km?: number;
  price_estimate?: number;
  delivery_id?: number;
  created_at: string;
  service_type?: string;
  package_size?: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  pickup_address: string;
  delivery_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
  merchant_id?: number;
  distance_km?: number;
  price_estimate?: number;
  payment_method?: string;
  service_type?: string;
  package_size?: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  notes?: string;
}

export const orderApi = {
  // Create new order
  createOrder: async (data: CreateOrderRequest) => {
    const response = await axios.post(`${API_BASE_URL}/orders`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get customer's orders
  getMyOrders: async () => {
    const response = await axios.get(`${API_BASE_URL}/orders`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: number) => {
    const response = await axios.post(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
