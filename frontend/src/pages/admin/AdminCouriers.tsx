import { useState } from 'react';
import { Truck, Search, Star, CheckCircle, XCircle, Clock, MapPin, Package } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, ShoppingBag, BarChart3 } from 'lucide-react';

export default function AdminCouriers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const couriers = [
    { 
      id: 1,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0923456789',
      status: 'active',
      rating: 4.8,
      totalDeliveries: 156,
      completedToday: 8,
      currentLocation: 'District 1, HCMC',
      earnings: 12500000,
      vehicleType: 'Motorcycle',
      licensePlate: '59A-12345',
      kycStatus: 'approved',
      joinedDate: '2024-02-20'
    },
    { 
      id: 2,
      name: 'Phạm Văn D',
      email: 'phamvand@email.com',
      phone: '0945678901',
      status: 'active',
      rating: 4.7,
      totalDeliveries: 142,
      completedToday: 6,
      currentLocation: 'District 3, HCMC',
      earnings: 11800000,
      vehicleType: 'Motorcycle',
      licensePlate: '59B-67890',
      kycStatus: 'approved',
      joinedDate: '2024-03-15'
    },
    { 
      id: 3,
      name: 'Nguyễn Văn G',
      email: 'nguyenvang@email.com',
      phone: '0956789012',
      status: 'offline',
      rating: 4.9,
      totalDeliveries: 138,
      completedToday: 0,
      currentLocation: 'District 5, HCMC',
      earnings: 11200000,
      vehicleType: 'Car',
      licensePlate: '51C-11111',
      kycStatus: 'approved',
      joinedDate: '2024-01-10'
    },
    { 
      id: 4,
      name: 'Lê Thị H',
      email: 'lethih@email.com',
      phone: '0967890123',
      status: 'pending',
      rating: 0,
      totalDeliveries: 0,
      completedToday: 0,
      currentLocation: 'N/A',
      earnings: 0,
      vehicleType: 'Motorcycle',
      licensePlate: '59D-22222',
      kycStatus: 'pending',
      joinedDate: '2024-11-10'
    },
  ];

  const menuItems = [
    { path: '/admin/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/couriers', icon: <Truck className="w-5 h-5" />, label: 'Couriers' },
    { path: '/admin/kyc-approvals', icon: <CheckCircle className="w-5 h-5" />, label: 'KYC Approval', badge: 12 },
    { path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
  ];

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = courier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courier.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || courier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
            Active
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
            Offline
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="admin" menuItems={menuItems}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courier Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage delivery couriers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="text-green-100 text-sm">Active Now</div>
            <div className="text-2xl font-bold mt-1">
              {couriers.filter(c => c.status === 'active').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg p-4 text-white">
            <div className="text-gray-100 text-sm">Offline</div>
            <div className="text-2xl font-bold mt-1">
              {couriers.filter(c => c.status === 'offline').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-yellow-100 text-sm">Pending KYC</div>
            <div className="text-2xl font-bold mt-1">
              {couriers.filter(c => c.kycStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-purple-100 text-sm">Total Couriers</div>
            <div className="text-2xl font-bold mt-1">
              {couriers.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Couriers Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Courier</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Deliveries</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">KYC</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {filteredCouriers.map((courier) => (
                  <tr key={courier.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">
                          {courier.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{courier.name}</div>
                          <div className="text-sm text-gray-500">{courier.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(courier.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {courier.rating > 0 ? (
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-900">{courier.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No ratings</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div>
                        <div className="font-semibold text-gray-900">{courier.totalDeliveries}</div>
                        {courier.completedToday > 0 && (
                          <div className="text-xs text-green-600">+{courier.completedToday} today</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{courier.vehicleType}</div>
                        <div className="text-xs text-gray-500">{courier.licensePlate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getKYCBadge(courier.kycStatus)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-semibold text-gray-900">
                        {courier.earnings.toLocaleString('vi-VN')}₫
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Couriers Map Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-orange-600 mr-2" />
            Active Couriers Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {couriers.filter(c => c.status === 'active').map((courier) => (
              <div key={courier.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{courier.name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                  {courier.currentLocation}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {courier.completedToday} deliveries completed today
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
