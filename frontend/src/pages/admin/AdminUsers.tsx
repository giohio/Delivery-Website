import { useState } from 'react';
import { Users, Search, MoreVertical, Shield, CheckCircle, Mail, Phone } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0912345678', role: 'customer', status: 'active', orders: 45, joined: '2024-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0923456789', role: 'shipper', status: 'active', deliveries: 156, joined: '2024-02-20' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0934567890', role: 'merchant', status: 'active', sales: 2340, joined: '2024-03-10' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0945678901', role: 'customer', status: 'suspended', orders: 12, joined: '2024-04-05' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0956789012', role: 'shipper', status: 'pending', deliveries: 0, joined: '2024-11-01' },
  ];

  const menuItems = [
    { path: '/admin/dashboard', icon: <Users className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <Shield className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Shield className="w-5 h-5" />, label: 'Shippers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: 12 },
    { path: '/admin/reports', icon: <Shield className="w-5 h-5" />, label: 'Reports' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'merchant': return 'bg-blue-100 text-blue-800';
      case 'shipper': return 'bg-orange-100 text-orange-800';
      case 'customer': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform users</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-medium">
            + Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="shipper">Shipper</option>
              <option value="merchant">Merchant</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Activity</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {user.role === 'customer' && `${user.orders} orders`}
                        {user.role === 'shipper' && `${user.deliveries} deliveries`}
                        {user.role === 'merchant' && `${user.sales} sales`}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      {new Date(user.joined).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg p-4 text-white">
            <div className="text-teal-100 text-sm">Total Customers</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role === 'customer').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 text-white">
            <div className="text-orange-100 text-sm">Total Shippers</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role === 'shipper').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">Total Merchants</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role === 'merchant').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-purple-100 text-sm">Active Users</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
