import { useState, useEffect } from 'react';
import { Building2, Truck, Check, X, Clock, User, Mail, Phone } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const menuItems = [
  { path: '/admin/dashboard', icon: <User />, label: 'Dashboard' },
  { path: '/admin/role-approvals', icon: <Check />, label: 'Role Approvals' },
];

interface RoleRegistration {
  user_role_id: number;
  user_id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  registration_type: 'merchant' | 'shipper';
  // Merchant fields
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
  business_license?: string;
  // Shipper fields
  vehicle_type?: string;
  license_plate?: string;
  id_card_number?: string;
}

export default function RoleApprovals() {
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load');
      }

      const data = await response.json();
      console.log('Role registrations data:', data);
      setMerchants(data.merchants || []);
      setShippers(data.shippers || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      alert('Error: ' + (error as any).message);
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Approvals</h1>
        <p className="text-gray-600 mb-6">Review and approve merchant and shipper registrations</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Merchants</p>
                <p className="text-3xl font-bold text-blue-600">{merchants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Shippers</p>
                <p className="text-3xl font-bold text-green-600">{shippers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('merchant')}
            className={`pb-3 px-4 font-medium transition-colors ${
              selectedTab === 'merchant'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Merchants ({merchants.length})
          </button>
          <button
            onClick={() => setSelectedTab('shipper')}
            className={`pb-3 px-4 font-medium transition-colors ${
              selectedTab === 'shipper'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shippers ({shippers.length})
          </button>
        </div>

        {/* Merchant Registrations */}
        {selectedTab === 'merchant' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">Debug: {merchants.length} merchant registrations found</p>
            </div>
            {merchants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending merchant registrations</p>
              </div>
            ) : (
              merchants.map((merchant) => (
                <div key={merchant.user_role_id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{merchant.shop_name}</h3>
                        <p className="text-sm text-gray-600">Submitted {new Date(merchant.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(merchant.user_role_id, 'merchant')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(merchant.user_role_id, 'merchant')}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Owner Information</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          {merchant.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {merchant.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {merchant.phone}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Shop Information</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Address:</span> {merchant.shop_address || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {merchant.shop_phone || 'N/A'}</p>
                        <p><span className="font-medium">License:</span> {merchant.business_license || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Shipper Registrations */}
        {selectedTab === 'shipper' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-800">Debug: {shippers.length} shipper registrations found</p>
            </div>
            {shippers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending shipper registrations</p>
              </div>
            ) : (
              shippers.map((shipper) => (
                <div key={shipper.user_role_id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{shipper.full_name}</h3>
                        <p className="text-sm text-gray-600">Submitted {new Date(shipper.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(shipper.user_role_id, 'shipper')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(shipper.user_role_id, 'shipper')}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Personal Information</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {shipper.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {shipper.phone}
                        </div>
                        <p className="text-gray-600"><span className="font-medium">ID Card:</span> {shipper.id_card_number}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Vehicle Information</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Type:</span> {shipper.vehicle_type}</p>
                        <p><span className="font-medium">License Plate:</span> {shipper.license_plate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
