const API_URL = 'http://localhost:5000';

export interface ApiKey {
  api_key_id: number;
  key_name: string;
  api_key: string;
  permissions: string[];
  is_active: boolean;
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreateApiKeyRequest {
  key_name: string;
  permissions: string[];
  rate_limit: number;
  expires_in_days: number | null;
}

export interface CreateApiKeyResponse {
  message: string;
  api_key_id: number;
  api_key: string;
  api_secret: string;
  key_name: string;
  permissions: string[];
  rate_limit: number;
  expires_at: string | null;
  created_at: string;
  warning: string;
}

export interface UpdateApiKeyRequest {
  key_name?: string;
  permissions?: string[];
  rate_limit?: number;
  is_active?: boolean;
}

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const apiKeyService = {
  // Lấy danh sách API keys
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await fetch(`${API_URL}/api/api-keys`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch API keys');
    }

    const data = await response.json();
    return data.api_keys;
  },

  // Tạo API key mới
  async createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await fetch(`${API_URL}/api/api-keys`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create API key');
    }

    return await response.json();
  },

  // Cập nhật API key
  async updateApiKey(apiKeyId: number, request: UpdateApiKeyRequest): Promise<void> {
    const response = await fetch(`${API_URL}/api/api-keys/${apiKeyId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update API key');
    }
  },

  // Xóa API key
  async deleteApiKey(apiKeyId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/api-keys/${apiKeyId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete API key');
    }
  },

  // Regenerate API secret
  async regenerateSecret(apiKeyId: number): Promise<{ api_secret: string }> {
    const response = await fetch(`${API_URL}/api/api-keys/${apiKeyId}/regenerate-secret`, {
      method: 'POST',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to regenerate secret');
    }

    return await response.json();
  },
};
