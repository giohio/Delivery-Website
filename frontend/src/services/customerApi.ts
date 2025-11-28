import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

export interface Order {
  id: string;
  date: string;
  from: string;
  to: string;
  items: string;
  price: number;
  status: 'completed' | 'pending' | 'waiting';
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface CreateOrderRequest {
  from: string;
  to: string;
  items: string;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'wallet';
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

class CustomerApiService {
  // Get customer dashboard stats
  async getCustomerStats(): Promise<OrderStats> {
    try {
      const response = await api.get('/customer/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      // Return mock data as fallback
      return {
        totalOrders: 3,
        completedOrders: 1,
        pendingOrders: 2,
        totalSpent: 65000
      };
    }
  }

  // Get customer orders with optional filters
  async getCustomerOrders(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const response = await api.get('/customer/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      // Return mock data as fallback
      return {
        orders: [
          {
            id: 'FD2024001234',
            date: '15/1/2024',
            from: 'Shop ABC - 123 Nguyễn Huệ, Q1',
            to: '456 Lê Lợi, Q3, TP.HCM',
            items: 'Quần áo thời trang (2 món)',
            price: 25000,
            status: 'completed'
          },
          {
            id: 'FD2024001235',
            date: '16/1/2024',
            from: 'Nhà hàng XYZ - 789 Trần Hưng Đạo, Q1',
            to: '321 Võ Văn Tần, Q3, TP.HCM',
            items: 'Đồ ăn nhanh',
            price: 18000,
            status: 'pending'
          },
          {
            id: 'FD2024001236',
            date: '16/1/2024',
            from: 'Siêu thị DEF - 555 Hai Bà Trưng, Q1',
            to: '789 Cách Mạng Tháng 8, Q10, TP.HCM',
            items: 'Thực phẩm tươi sống',
            price: 22000,
            status: 'waiting'
          }
        ],
        total: 3
      };
    }
  }

  // Get single order details
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get(`/customer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await api.post('/customer/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await api.put(`/customer/orders/${orderId}/cancel`);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Get customer profile
  async getCustomerProfile(): Promise<CustomerProfile> {
    try {
      const response = await api.get('/customer/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      // Return mock data as fallback
      return {
        id: '1',
        name: 'Soul Knight',
        email: 'soulknight@example.com',
        phone: '0123456789',
        address: '123 Nguyễn Huệ, Q1, TP.HCM'
      };
    }
  }

  // Update customer profile
  async updateCustomerProfile(profileData: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      const response = await api.put('/customer/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer profile:', error);
      throw error;
    }
  }

  // Track order
  async trackOrder(orderId: string): Promise<{
    status: string;
    location: string;
    estimatedDelivery: string;
    history: Array<{
      status: string;
      timestamp: string;
      location: string;
    }>;
  }> {
    try {
      const response = await api.get(`/customer/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }
}

export const customerApiService = new CustomerApiService();
export default customerApiService;
