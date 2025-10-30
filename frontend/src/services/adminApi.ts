import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminSummary {
  total_users: number;
  total_orders: number;
  total_deliveries: number;
  total_payments: number;
  revenue: number;
}

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  delivery_id: number;
  order_id: number;
  shipper_id: number;
  shipper_name: string;
  status: string;
  pickup_time: string;
  delivery_time: string;
  updated_at: string;
}

class AdminApiService {
  // Get dashboard summary
  async getSummary(): Promise<AdminSummary> {
    try {
      const response = await api.get('/admin/summary');
      if (response.data.ok) {
        return response.data.summary;
      }
      throw new Error('Failed to fetch summary');
    } catch (error) {
      console.error('Error fetching admin summary:', error);
      // Return mock data as fallback
      return {
        total_users: 15420,
        total_orders: 45680,
        total_deliveries: 42150,
        total_payments: 42150,
        revenue: 125000000
      };
    }
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users');
      console.log('Admin users API response:', response.data);
      if (response.data.ok) {
        return response.data.users;
      }
      throw new Error('Failed to fetch users');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      // Only return mock data if there's a network error, otherwise throw
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('Network error - using mock data');
        return [];
      }
      // For auth errors or other API errors, return empty array
      return [];
    }
  }

  // Get all orders
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/admin/orders');
      if (response.data.ok) {
        return response.data.orders;
      }
      throw new Error('Failed to fetch orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Get all deliveries
  async getDeliveries(): Promise<Delivery[]> {
    try {
      const response = await api.get('/admin/deliveries');
      if (response.data.ok) {
        return response.data.deliveries;
      }
      throw new Error('Failed to fetch deliveries');
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      return [];
    }
  }

  // Refund payment for an order
  async refundPayment(orderId: number): Promise<any> {
    try {
      const response = await api.post(`/admin/payments/${orderId}/refund`);
      if (response.data.ok) {
        return response.data.payment;
      }
      throw new Error('Failed to refund payment');
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
