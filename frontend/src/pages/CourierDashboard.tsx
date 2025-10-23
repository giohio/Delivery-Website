import React, { useState } from 'react';
import { Package, DollarSign, Navigation, Star, Clock, MapPin, Phone, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  pickup: {
    address: string;
    name?: string;
  };
  delivery: {
    address: string;
    customer: string;
    phone: string;
  };
  distance: string;
  estimatedTime: string;
  price: string;
  weight?: string;
  status: 'available' | 'picked' | 'completed';
  rating?: number;
  completedTime?: string;
  category?: string;
}

const CourierDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  // Mock data
  const stats = {
    todayOrders: 8,
    todayEarnings: '180,000',
    totalDistance: '45.2',
    averageRating: 4.8,
    onlineTime: '6h 30m'
  };

  const currentOrder: Order | null = {
    id: '#FD2024001235',
    pickup: {
      address: 'Nhà hàng XYZ - 789 Trần Hưng Đạo, Q1',
    },
    delivery: {
      address: '321 Võ Văn Tần, Q3, TP.HCM',
      customer: 'Trần Thị B',
      phone: '0901234567'
    },
    distance: '3.1km',
    estimatedTime: '15 phút',
    price: '18,000',
    status: 'picked'
  };

  const availableOrders: Order[] = [
    {
      id: '#FD2024001234',
      pickup: {
        name: 'Shop ABC',
        address: '123 Nguyễn Huệ, Q1'
      },
      delivery: {
        address: '456 Lê Lợi, Q3, TP.HCM',
        customer: 'Nguyễn Văn A',
        phone: '0909123456'
      },
      distance: '5.2km',
      estimatedTime: '25 phút',
      price: '25,000',
      weight: '1.5kg',
      status: 'available'
    }
  ];

  const completedOrders: Order[] = [
    {
      id: '#FD2024001236',
      pickup: {
        name: 'Lê Văn C',
        address: 'Lê Văn C • 7.8km'
      },
      delivery: {
        address: 'Thực phẩm tươi sống',
        customer: 'Lê Văn C',
        phone: ''
      },
      distance: '7.8km',
      estimatedTime: '',
      price: '22,000',
      status: 'completed',
      rating: 5,
      completedTime: '12:42'
    }
  ];

  const handleNavigate = () => {
    // TODO: Open navigation/maps
    alert('Mở điều hướng đến địa chỉ giao hàng');
  };

  const handleCompleteDelivery = () => {
    // TODO: Mark order as completed
    alert('Xác nhận hoàn thành giao hàng');
  };

  const handleAcceptOrder = (orderId: string) => {
    // TODO: Accept order
    alert(`Nhận đơn hàng ${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">FastDelivery</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-200">
                Tài xế
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Online Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isOnline ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                </span>
              </div>

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                SK
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào Soul Knight!</h2>
          <p className="text-gray-600">Hôm nay là ngày làm việc tốt lành. Chúc bạn giao hàng an toàn!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Đơn hàng hôm nay</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Thu nhập</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayEarnings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Navigation className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Quãng đường</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDistance}km</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Đánh giá TB</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Thời gian online</p>
            <p className="text-3xl font-bold text-gray-900">{stats.onlineTime}</p>
          </div>
        </div>

        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Đơn hàng hiện tại</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Đã lấy hàng
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Bình thường
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Lấy hàng tại:</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-gray-900">{currentOrder.pickup.address}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Giao đến:</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-gray-900">{currentOrder.delivery.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{currentOrder.delivery.customer}</span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Khoảng cách</p>
                    <p className="font-bold text-gray-900">{currentOrder.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Thời gian dự kiến</p>
                    <p className="font-bold text-gray-900">{currentOrder.estimatedTime}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{currentOrder.id}</p>
                  <p className="text-sm text-gray-600">{currentOrder.price} VNĐ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNavigate}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Navigation className="w-5 h-5" />
                Điều hướng
              </button>
              <button
                onClick={handleCompleteDelivery}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Hoàn thành giao hàng
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Orders */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng khả dụng</h3>
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{order.id}</span>
                    <span className="text-lg font-bold text-blue-600">{order.price} VNĐ</span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{order.pickup.name} - {order.pickup.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{order.delivery.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">{order.distance}</span>
                    <span className="text-gray-600">{order.estimatedTime}</span>
                    <span className="text-gray-600">{order.weight}</span>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Nhận đơn hàng
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Today */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đã hoàn thành hôm nay</h3>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{order.id}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-green-600">{order.price} VNĐ</span>
                      <div className="flex items-center gap-1 ml-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{order.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Hoàn thành lúc: {order.completedTime}</p>
                    <p className="text-sm font-medium text-gray-900">{order.pickup.address}</p>
                    <p className="text-sm text-gray-600">{order.delivery.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourierDashboard;
