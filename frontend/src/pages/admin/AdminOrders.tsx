import { useState } from 'react';
import { Package, Search, Eye, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, ShoppingBag, Truck, BarChart3 } from 'lucide-react';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = [
    { 
      id: 'ORD-001', 
      customer: 'Nguyễn Văn A',
      pickup: '123 Đường Lê Lợi, Q1',
      dropoff: '456 Đường Nguyễn Huệ, Q1',
      courier: 'Trần Thị B',
      status: 'completed',
      amount: 45000,
      created: '2024-11-13 10:30',
      completed: '2024-11-13 11:15'
    },
    { 
      id: 'ORD-002', 
      customer: 'Lê Văn C',
      pickup: '789 Đường Pasteur, Q3',
      dropoff: '321 Đường Điện Biên Phủ, Q3',
      courier: 'Phạm Văn D',
      status: 'in_transit',
      amount: 38000,
      created: '2024-11-13 11:00',
      completed: null
    },
    { 
      id: 'ORD-003', 
      customer: 'Hoàng Thị E',
      pickup: '555 Đường Cách Mạng, Q10',
      dropoff: '888 Đường 3 Tháng 2, Q10',
      courier: null,
      status: 'pending',
      amount: 52000,
      created: '2024-11-13 11:30',
      completed: null
    },
    { 
      id: 'ORD-004', 
      customer: 'Trịnh Văn F',
      pickup: '222 Đường Trần Hưng Đạo, Q5',
      dropoff: '999 Đường Nguyễn Trãi, Q5',
      courier: 'Nguyễn Văn G',
      status: 'cancelled',
      amount: 41000,
      created: '2024-11-13 09:00',
      completed: null
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 mr-1" />
            In Transit
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
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
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="text-green-100 text-sm">Completed</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="text-blue-100 text-sm">In Transit</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'in_transit').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-yellow-100 text-sm">Pending</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-red-100 text-sm">Cancelled</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'cancelled').length}
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
                placeholder="Search by order ID or customer..."
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
              <option value="completed">Completed</option>
              <option value="in_transit">In Transit</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Route</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Courier</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">{order.created}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{order.customer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 line-clamp-1">{order.pickup}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 line-clamp-1">{order.dropoff}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {order.courier ? (
                        <span className="text-sm text-gray-900">{order.courier}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-semibold text-gray-900">
                        {order.amount.toLocaleString('vi-VN')}₫
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-purple-100 mt-1">{selectedOrder.id}</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer</label>
                    <p className="mt-1 text-gray-900 font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {selectedOrder.amount.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Courier</label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {selectedOrder.courier || 'Not assigned'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup Location</label>
                  <p className="mt-1 text-gray-900">{selectedOrder.pickup}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Dropoff Location</label>
                  <p className="mt-1 text-gray-900">{selectedOrder.dropoff}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="mt-1 text-gray-900">{selectedOrder.created}</p>
                  </div>
                  {selectedOrder.completed && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Completed</label>
                      <p className="mt-1 text-gray-900">{selectedOrder.completed}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
