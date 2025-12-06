import { useState, useEffect } from 'react';
import { Users, Search, MoreVertical, Shield, CheckCircle, Mail, Phone, X, UserPlus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        console.error('[AdminUsers] No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.ok && data.users) {
        console.log('[AdminUsers] Loaded users:', data.users.length);
        setUsers(data.users);
      } else {
        console.error('[AdminUsers] Failed to load users:', data.error);
      }
    } catch (error) {
      console.error('[AdminUsers] Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <Users className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <Shield className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Shield className="w-5 h-5" />, label: 'Shippers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: 12 },
    { path: '/admin/reports', icon: <Shield className="w-5 h-5" />, label: 'Reports' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role_name === filterRole;
    const matchesStatus = filterStatus === 'all' || (user.is_active ? 'active' : 'inactive') === filterStatus;
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

  const handleAddUser = async () => {
    console.log('[Add User] Starting...', newUser);
    
    // Validate required fields
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields (Name, Email, Password)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    console.log('[Add User] Validation passed');
    setIsSubmitting(true);

    try {
      // Use AuthContext to get token (handles sessionStorage automatically)
      const token = getToken();
      
      console.log('[Add User] Getting token from AuthContext...');
      console.log('[Add User] Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        alert('Session expired. Please login again.\n\nYou will be redirected to login page.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        setIsSubmitting(false);
        return;
      }
      
      console.log('[Add User] Token preview:', token.substring(0, 20) + '...');

      const requestBody = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role
      };

      console.log('[Add User] Sending request:', requestBody);

      const response = await fetch('http://localhost:5000/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[Add User] Response status:', response.status);

      const data = await response.json();
      console.log('[Add User] Response data:', data);

      if (data.ok) {
        alert(`User created successfully!\n\nName: ${data.user.full_name}\nEmail: ${data.user.email}\nRole: ${data.user.role_name}`);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'customer',
        });
        // Reload users list instead of full page refresh
        await loadUsers();
      } else {
        console.error('[Add User] Error:', data.error);
        alert(`Failed to create user:\n${data.error}`);
      }
    } catch (error) {
      console.error('[Add User] Exception:', error);
      alert('Failed to create user. Please check:\n1. Backend server is running\n2. You have admin permissions\n3. Network connection is active');
    } finally {
      setIsSubmitting(false);
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
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add User</span>
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
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_name)}`}>
                          {user.role_name.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.is_active ? 'active' : 'inactive')}`}>
                          {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
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
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg p-4 text-white">
            <div className="text-teal-100 text-sm">Total Customers</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role_name === 'customer').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 text-white">
            <div className="text-orange-100 text-sm">Total Shippers</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role_name === 'shipper').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">Total Merchants</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.role_name === 'merchant').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-purple-100 text-sm">Active Users</div>
            <div className="text-2xl font-bold mt-1">
              {users.filter(u => u.is_active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Add New User</h2>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="customer">Customer</option>
                  <option value="shipper">Shipper</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex space-x-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.phone || !newUser.password || isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Add User</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
