import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Rating {
  rating_id: number;
  delivery_id: number;
  customer_id: number;
  shipper_id: number;
  score: number;
  comment?: string;
  created_at: string;
}

export interface CreateRatingRequest {
  score: number;
  comment?: string;
}

export const ratingApi = {
  // Leave rating for delivery (customer only)
  createRating: async (deliveryId: number, data: CreateRatingRequest) => {
    const response = await axios.post(
      `${API_BASE_URL}/ratings/${deliveryId}`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Get ratings for a shipper
  getShipperRatings: async (shipperId: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/ratings/shipper/${shipperId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Get rating for a delivery
  getDeliveryRating: async (deliveryId: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/ratings/delivery/${deliveryId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
