import { Clock, Check, Star, Gift, Zap, Crown, Award } from 'lucide-react';

const services = [
  { 
    name: 'Standard', 
    time: '2-4 giờ', 
    price: '15,000', 
    originalPrice: '18,000',
    color: 'from-blue-500 to-blue-600',
    icon: Clock,
    description: 'Giao hàng cơ bản với theo dõi GPS',
    features: [
      'Theo dõi GPS thời gian thực',
      'Bảo hiểm hàng hóa cơ bản',
      'Hỗ trợ khách hàng 24/7',
      'Thu hộ COD miễn phí',
      'Giao hàng trong giờ hành chính'
    ],
    popular: false
  },
  { 
    name: 'Fast', 
    time: '1-2 giờ', 
    price: '25,000', 
    originalPrice: '30,000',
    color: 'from-orange-500 to-orange-600',
    icon: Zap,
    description: 'Dịch vụ ưu tiên với bảo hiểm toàn diện',
    features: [
      'Tất cả tính năng Standard',
      'Bảo hiểm toàn diện đến 5 triệu',
      'Ưu tiên phân công tài xế',
      'Giao hàng ngoài giờ (phụ phí)',
      'Hỗ trợ đặc biệt qua hotline'
    ],
    popular: true
  },
  { 
    name: 'Express', 
    time: '30-60 phút', 
    price: '35,000', 
    originalPrice: '45,000',
    color: 'from-purple-500 to-purple-600',
    icon: Crown,
    description: 'Dịch vụ VIP cao cấp với hỗ trợ đặc biệt',
    features: [
      'Tất cả tính năng Fast',
      'Bảo hiểm VIP đến 10 triệu',
      'Tài xế chuyên nghiệp',
      'Giao hàng 24/7 không phụ phí',
      'Quản lý tài khoản riêng'
    ],
    popular: false
  }
];

const additionalServices = [
  { name: 'Giao hàng cuối tuần', price: '+5,000 VND' },
  { name: 'Giao hàng ban đêm (22h-6h)', price: '+8,000 VND' },
  { name: 'Hàng dễ vỡ/đặc biệt', price: '+10,000 VND' },
  { name: 'Thu hộ COD trên 5 triệu', price: '0.5% giá trị đơn hàng' }
];

const loyaltyProgram = [
  { milestone: '10 đơn hàng', discount: '5%', icon: Gift },
  { milestone: '50 đơn hàng', discount: '10%', icon: Star },
  { milestone: '100 đơn hàng', discount: '15%', icon: Award }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            💰 <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Bảng giá dịch vụ</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn gói dịch vụ phù hợp với nhu cầu của bạn - Giá cả minh bạch, không phí ẩn
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service.name}
              className={`bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 ${
                service.popular ? 'border-orange-400 ring-4 ring-orange-100' : 'border-gray-100 hover:border-blue-200'
              } relative`}
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Phổ biến nhất
                  </div>
                </div>
              )}
              
              <div className={`bg-gradient-to-br ${service.color} p-8 text-white`}>
                <service.icon className="mb-4" size={48} />
                <h3 className="text-3xl font-bold mb-2">{service.name}</h3>
                <p className="text-white/90 mb-4">{service.description}</p>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{service.time}</span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">{service.price}</span>
                    <span className="text-lg text-gray-600">VND</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">{service.originalPrice} VND</span>
                    <span className="text-sm text-green-600 font-semibold">Tiết kiệm {Math.round(((parseInt(service.originalPrice) - parseInt(service.price)) / parseInt(service.originalPrice)) * 100)}%</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  service.popular 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transform hover:scale-105' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transform hover:scale-105'
                }`}>
                  Chọn gói {service.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">📦 Dịch vụ bổ sung</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, idx) => (
              <div key={idx} className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                <p className="text-blue-600 font-bold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <h3 className="text-3xl font-bold text-center mb-8">🎆 Chương trình khách hàng thân thiết</h3>
          <p className="text-center text-purple-100 mb-8 text-lg">Càng sử dụng nhiều, càng tiết kiệm nhiều!</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {loyaltyProgram.map((level, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <level.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-2">{level.milestone}</h4>
                <p className="text-3xl font-bold text-yellow-300 mb-2">Giảm {level.discount}</p>
                <p className="text-purple-100 text-sm">cho tất cả đơn hàng tiếp theo</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
