import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Notification {
  notification_id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  // Get all notifications for current user
  getNotifications: async () => {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number) => {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Clear all read notifications
  clearReadNotifications: async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/clear-read`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
