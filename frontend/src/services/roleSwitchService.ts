import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export interface UserRole {
  role_id: number;
  role_name: string;
  is_active: boolean;
  approved_at: string | null;
}

export interface RoleSwitchResponse {
  roles: UserRole[];
  current_role_id: number;
}

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const roleSwitchService = {
  // Get all available roles for current user
  async getAvailableRoles(): Promise<RoleSwitchResponse> {
    const response = await fetch(`${API_URL}/api/roles/available`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch roles');
    }

    return await response.json();
  },

  // Switch to a different role
  async switchRole(roleId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/roles/switch`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ role_id: roleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to switch role');
    }

    return await response.json();
  },

  // Register as merchant
  async registerAsMerchant(data: {
    shop_name: string;
    shop_address?: string;
    shop_phone?: string;
    business_license?: string;
  }): Promise<void> {
    const response = await fetch(`${API_URL}/api/roles/register-merchant`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register as merchant');
    }

    return await response.json();
  },

  // Register as shipper
  async registerAsShipper(data: {
    vehicle_type: string;
    license_plate?: string;
    id_card_number: string;
  }): Promise<void> {
    const response = await fetch(`${API_URL}/api/roles/register-shipper`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register as shipper');
    }

    return await response.json();
  },

  // Get current role
  async getCurrentRole(): Promise<{ current_role_id: number; current_role_name: string }> {
    const response = await fetch(`${API_URL}/api/roles/current`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get current role');
    }

    return await response.json();
  },
};

// Custom hook for role switching
export function useRoleSwitch() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<number>(4);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleSwitchService.getAvailableRoles();
      setRoles(data.roles);
      setCurrentRoleId(data.current_role_id);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const switchRole = async (roleId: number) => {
    try {
      await roleSwitchService.switchRole(roleId);
      setCurrentRoleId(roleId);
      
      // Redirect based on role
      const roleRedirects: { [key: number]: string } = {
        1: '/admin/dashboard',
        2: '/merchant/dashboard',
        3: '/shipper/dashboard',
        4: '/customer/dashboard',
      };
      
      const redirectPath = roleRedirects[roleId] || '/customer/dashboard';
      console.log(`Switching to role ${roleId}, redirecting to ${redirectPath}`);
      
      // Force full page reload to new dashboard
      window.location.href = redirectPath;
    } catch (error: any) {
      alert('❌ Failed to switch role: ' + error.message);
    }
  };

  return { roles, currentRoleId, loading, switchRole, loadRoles };
}
