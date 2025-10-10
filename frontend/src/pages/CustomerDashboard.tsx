import React, { useState } from 'react';
import { Search, Package, CheckCircle, Clock, CreditCard, Plus, Search as SearchIcon, User } from 'lucide-react';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

interface Order {
  id: string;
  date: string;
  from: string;
  to: string;
  items: string;
  price: number;
  status: 'completed' | 'pending' | 'waiting';
}

const CustomerDashboard: React.FC = () => {
  const [stats] = useState<OrderStats>({
    totalOrders: 3,
    completedOrders: 1,
    pendingOrders: 2,
    totalSpent: 65000
  });

  const [orders] = useState<Order[]>([
    {
      id: 'FD2024001234',
      date: '15/1/2024',
      from: 'Shop ABC - 123 Nguyễn Huệ, Q1',
      to: '456 Lê Lợi, Q3, TP.HCM',
      items: 'Quần áo thời trang (2 món)',
      price: 25000,
      status: 'completed'
    },
    {
      id: 'FD2024001235',
      date: '16/1/2024',
      from: 'Nhà hàng XYZ - 789 Trần Hưng Đạo, Q1',
      to: '321 Võ Văn Tần, Q3, TP.HCM',
      items: 'Đồ ăn nhanh',
      price: 18000,
      status: 'pending'
    },
    {
      id: 'FD2024001236',
      date: '16/1/2024',
      from: 'Siêu thị DEF - 555 Hai Bà Trưng, Q1',
      to: '789 Cách Mạng Tháng 8, Q10, TP.HCM',
      items: 'Thực phẩm tươi sống',
      price: 22000,
      status: 'waiting'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã giao';
      case 'pending': return 'Đang giao';
      case 'waiting': return 'Chờ xử lý';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Khách hàng</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, Soul Knight!
          </h2>
          <p className="text-gray-600">Quản lý đơn hàng và theo dõi giao hàng của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Tính năng tạo đơn hàng mới sẽ được phát triển sau')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="font-medium">Tạo đơn hàng mới</span>
            </button>
            
            <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors">
              <SearchIcon className="w-8 h-8" />
              <span className="font-medium">Tra cứu đơn hàng</span>
            </button>
            
            <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 p-6 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors">
              <User className="w-8 h-8" />
              <span className="font-medium">Cập nhật hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Đơn hàng của bạn</h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="completed">Đã giao</option>
                  <option value="pending">Đang giao</option>
                  <option value="waiting">Chờ xử lý</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">#{order.id}</span>
                      </div>
                      <span className="text-sm text-gray-500">{order.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Từ:</span> {order.from}
                      </div>
                      <div>
                        <span className="font-medium">Đến:</span> {order.to}
                      </div>
                      <div>
                        <span className="font-medium">Hàng hóa:</span> {order.items}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {order.price.toLocaleString()} VND
                    </div>
                    <div className="space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Chi tiết
                      </button>
                      {order.status === 'pending' && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium">
                          Theo dõi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
