import DashboardLayout from '../../layouts/DashboardLayout';
import { Shield, CheckCircle, XCircle, Clock, User, FileText, Image as ImageIcon, Loader, Package, Users, ShoppingBag, Truck, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface KYCSubmission {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  id_front_image: string;
  id_back_image: string;
  driver_license: string;
  license_image: string;
  vehicle_type: string;
  license_plate: string;
  vehicle_image: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export default function AdminKYCApproval() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [processing, setProcessing] = useState(false);

  const pendingCount = submissions.filter(s => s.verification_status === 'pending').length;

  const menuItems = [
    { path: '/admin/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Truck className="w-5 h-5" />, label: 'Couriers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: pendingCount },
    { path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
  ];

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const endpoint = filter === 'all' 
        ? `/admin/kyc/all` 
        : `/admin/kyc/all?status=${filter}`;
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading KYC submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    if (!confirm('Are you sure you want to APPROVE this KYC submission?')) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/admin/kyc/${userId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.ok) {
        alert('KYC Approved successfully!');
        loadSubmissions();
      } else {
        alert(data.error || 'Failed to approve KYC');
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Failed to approve KYC');
    } finally {
      setProcessing(false);
      setSelectedSubmission(null);
    }
  };

  const handleReject = async (userId: number) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/admin/kyc/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      
      const data = await response.json();
      if (data.ok) {
        alert('KYC Rejected');
        loadSubmissions();
      } else {
        alert(data.error || 'Failed to reject KYC');
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Failed to reject KYC');
    } finally {
      setProcessing(false);
      setSelectedSubmission(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.verification_status === 'pending').length,
    approved: submissions.filter(s => s.verification_status === 'approved').length,
    rejected: submissions.filter(s => s.verification_status === 'rejected').length,
  };

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">Review and approve courier registration documents</p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex space-x-1 p-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No {filter !== 'all' ? filter : ''} submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold mr-3">
                          {submission.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{submission.full_name}</p>
                          <p className="text-sm text-gray-500">ID: {submission.id_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{submission.email}</p>
                      <p className="text-sm text-gray-500">{submission.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 capitalize">{submission.vehicle_type}</p>
                      <p className="text-sm text-gray-500">{submission.license_plate}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(submission.verification_status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Review KYC Submission</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Number</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.id_number}</p>
                  </div>
                </div>
              </div>

              {/* ID Card Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  ID Card Photos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Front Side</p>
                    <img
                      src={selectedSubmission.id_front_image}
                      alt="ID Front"
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Back Side</p>
                    <img
                      src={selectedSubmission.id_back_image}
                      alt="ID Back"
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Driver License */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Driver License
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-600">License Number</p>
                  <p className="font-medium text-gray-900">{selectedSubmission.driver_license}</p>
                </div>
                <img
                  src={selectedSubmission.license_image}
                  alt="License"
                  className="w-full max-w-md rounded-lg border border-gray-200"
                />
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedSubmission.vehicle_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.license_plate}</p>
                  </div>
                </div>
                <img
                  src={selectedSubmission.vehicle_image}
                  alt="Vehicle"
                  className="w-full max-w-md rounded-lg border border-gray-200"
                />
              </div>

              {/* Action Buttons */}
              {selectedSubmission.verification_status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedSubmission.user_id)}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.user_id)}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
