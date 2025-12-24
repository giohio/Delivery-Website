import { useState, useEffect } from 'react';
import { Building2, Truck, Check, X } from 'lucide-react';

interface RoleRegistration {
  user_role_id: number;
  user_id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  registration_type: 'merchant' | 'shipper';
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
  business_license?: string;
  vehicle_type?: string;
  license_plate?: string;
  id_card_number?: string;
}

export default function RoleApprovalsSection() {
  const [merchants, setMerchants] = useState<RoleRegistration[]>([]);
  const [shippers, setShippers] = useState<RoleRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'merchant' | 'shipper'>('merchant');

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/admin/role-registrations/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load');

      const data = await response.json();
      setMerchants(data.merchants || []);
      setShippers(data.shippers || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userRoleId: number, type: string) => {
    if (!confirm(`Approve this ${type} registration?`)) return;

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/admin/role-registrations/${userRoleId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to approve');
      alert('✅ Registration approved!');
      loadPendingRegistrations();
    } catch (error: any) {
      alert('❌ ' + error.message);
    }
  };

  const handleReject = async (userRoleId: number, type: string) => {
    const reason = prompt(`Reason for rejecting this ${type} registration?`);
    if (!reason) return;

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/admin/role-registrations/${userRoleId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Failed to reject');
      alert('✅ Registration rejected');
      loadPendingRegistrations();
    } catch (error: any) {
      alert('❌ ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Role Approvals</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalPending = merchants.length + shippers.length;

  if (totalPending === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Role Approvals</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No pending role approvals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Role Approvals ({totalPending} pending)
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('merchant')}
          className={`pb-2 px-3 font-medium transition-colors ${
            selectedTab === 'merchant'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-1" />
          Merchants ({merchants.length})
        </button>
        <button
          onClick={() => setSelectedTab('shipper')}
          className={`pb-2 px-3 font-medium transition-colors ${
            selectedTab === 'shipper'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Truck className="w-4 h-4 inline mr-1" />
          Shippers ({shippers.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {selectedTab === 'merchant' && merchants.map((merchant) => (
          <div key={merchant.user_role_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{merchant.shop_name}</h4>
                  <p className="text-xs text-gray-600">{merchant.full_name} • {merchant.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(merchant.user_role_id, 'merchant')}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(merchant.user_role_id, 'merchant')}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
              <div>📍 {merchant.shop_address || 'N/A'}</div>
              <div>📞 {merchant.shop_phone || 'N/A'}</div>
            </div>
          </div>
        ))}

        {selectedTab === 'shipper' && shippers.map((shipper) => (
          <div key={shipper.user_role_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{shipper.full_name}</h4>
                  <p className="text-xs text-gray-600">{shipper.email} • {shipper.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(shipper.user_role_id, 'shipper')}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(shipper.user_role_id, 'shipper')}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
              <div>🚗 {shipper.vehicle_type || 'Not specified'}</div>
              <div>🪪 {shipper.id_card_number || 'Not specified'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
