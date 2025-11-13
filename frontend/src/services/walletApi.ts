import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Wallet {
  wallet_id: number;
  shipper_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  transaction_id: number;
  shipper_id: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  ref_delivery_id?: number;
  note?: string;
  balance_after: number;
  created_at: string;
}

export const walletApi = {
  // Get wallet balance (shipper only)
  getWallet: async () => {
    const response = await axios.get(`${API_BASE_URL}/wallet`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get wallet transactions
  getTransactions: async () => {
    const response = await axios.get(`${API_BASE_URL}/wallet/transactions`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
