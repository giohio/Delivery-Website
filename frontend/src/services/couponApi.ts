const API_URL = 'http://localhost:5000';

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface Coupon {
  coupon_id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  usage_limit?: number;
  used_count: number;
  description?: string;
}

export const couponApi = {
  getAvailableCoupons: async (): Promise<{ coupons: Coupon[] }> => {
    const response = await fetch(`${API_URL}/api/coupons/available`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch available coupons');
    }
    
    return response.json();
  },

  getMyCoupons: async (): Promise<{ coupons: Coupon[] }> => {
    const response = await fetch(`${API_URL}/api/user/coupons`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch my coupons');
    }
    
    return response.json();
  },

  validateCoupon: async (code: string, orderAmount: number): Promise<{ valid: boolean; discount?: number; final_amount?: number; message?: string }> => {
    const response = await fetch(`${API_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, order_amount: orderAmount }),
    });
    
    const data = await response.json();
    
    // If HTTP error (500, etc.), throw error
    if (!response.ok && response.status >= 500) {
      throw new Error(data.error || 'Failed to validate coupon');
    }
    
    // If validation response (ok: true/false, valid: true/false)
    if (data.ok !== undefined) {
      return {
        valid: data.valid || false,
        discount: data.discount || 0,
        final_amount: data.final_amount,
        message: data.message
      };
    }
    
    // Fallback for error response
    return {
      valid: false,
      message: data.error || data.message || 'Invalid coupon'
    };
  },

  applyCoupon: async (orderId: number, couponCode: string): Promise<any> => {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/apply-coupon`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coupon_code: couponCode }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply coupon');
    }
    
    return response.json();
  },
};
