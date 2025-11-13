const API_URL = 'http://localhost:5000';

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface CourierProfile {
  user_id: number;
  email: string;
  full_name: string;
  phone?: string;
  operating_area?: string;
  vehicle_type: 'motorbike' | 'car' | 'bicycle';
  license_plate?: string;
  id_number?: string;
  driver_license?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  id_front_image?: string;
  id_back_image?: string;
  license_image?: string;
  vehicle_image?: string;
}

export const courierApi = {
  // Get courier profile
  getProfile: async (): Promise<CourierProfile> => {
    const response = await fetch(`${API_URL}/api/courier/profile`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courier profile');
    }
    
    return response.json();
  },

  // Update courier profile
  updateProfile: async (data: Partial<CourierProfile>) => {
    const response = await fetch(`${API_URL}/api/courier/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return response.json();
  },

  // Get verification status
  getVerificationStatus: async () => {
    const response = await fetch(`${API_URL}/api/courier/verification-status`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch verification status');
    }
    
    return response.json();
  },
};
