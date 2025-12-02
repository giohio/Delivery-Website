import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Delivery {
  delivery_id: number;
  shipper_id: number;
  max_capacity: number;
  status: 'ASSIGNED' | 'ONGOING' | 'COMPLETED' | 'CANCELED';
  assigned_at: string;
  delivered_at?: string;
  updated_at: string;
}

export interface TrackingEvent {
  event_id: number;
  delivery_id: number;
  event_type: string;
  status?: string;
  description?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

export interface CreateDeliveryRequest {
  order_ids: number[];
  max_capacity?: number;
}

export interface UpdateDeliveryStatusRequest {
  status: 'ONGOING' | 'COMPLETED' | 'CANCELED';
  note?: string;
  lat?: number;
  lng?: number;
}

export const deliveryApi = {
  // Get available orders (shipper only)
  getAvailableOrders: async () => {
    const response = await axios.get(`${API_BASE_URL}/deliveries/available`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Create delivery (assign orders to shipper)
  createDelivery: async (data: CreateDeliveryRequest) => {
    const response = await axios.post(`${API_BASE_URL}/deliveries`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Update delivery status
  updateDeliveryStatus: async (
    deliveryId: number,
    data: UpdateDeliveryStatusRequest
  ) => {
    const response = await axios.put(
      `${API_BASE_URL}/deliveries/${deliveryId}/status`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Get shipper's deliveries
  getMyDeliveries: async () => {
    const response = await axios.get(`${API_BASE_URL}/deliveries/my`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get tracking events for a delivery
  getDeliveryTracking: async (deliveryId: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/deliveries/${deliveryId}/tracking`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Accept an order (create delivery with single order)
  acceptOrder: async (orderId: number) => {
    const response = await axios.post(
      `${API_BASE_URL}/deliveries`,
      { order_ids: [orderId] },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
