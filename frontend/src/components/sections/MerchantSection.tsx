import { Users, Check, Upload, BarChart3, CreditCard, Zap, Code, Database, Webhook, FileText, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Tải lên đơn hàng hàng loạt',
    desc: 'Import dễ dàng từ file Excel/CSV',
    color: 'text-blue-600'
  },
  {
    icon: BarChart3,
    title: 'Phân tích và báo cáo chi tiết',
    desc: 'Dashboard thống kê toàn diện',
    color: 'text-green-600'
  },
  {
    icon: CreditCard,
    title: 'Phương thức thanh toán linh hoạt',
    desc: 'Hỗ trợ nhiều hình thức thanh toán',
    color: 'text-purple-600'
  },
  {
    icon: Zap,
    title: 'Khả năng tích hợp API',
    desc: 'Tích hợp dễ dàng với hệ thống của bạn',
    color: 'text-orange-600'
  }
];

const pricingPlans = [
  {
    name: 'Cơ bản',
    price: '18,000',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Đến 100 đơn hàng/tháng',
      'Dashboard cơ bản',
      'Hỗ trợ qua email',
      'Tải lên file Excel'
    ],
    popular: false
  },
  {
    name: 'Chuyên nghiệp',
    price: '16,000',
    color: 'from-purple-500 to-purple-600',
    features: [
      'Đến 1,000 đơn hàng/tháng',
      'Dashboard nâng cao',
      'Hỗ trợ 24/7',
      'API tích hợp',
      'Báo cáo chi tiết'
    ],
    popular: true
  },
  {
    name: 'Doanh nghiệp',
    price: '14,000',
    color: 'from-green-500 to-green-600',
    features: [
      'Không giới hạn đơn hàng',
      'Tính năng đầy đủ',
      'Quản lý tài khoản riêng',
      'Tích hợp tùy chỉnh',
      'SLA ưu tiên'
    ],
    popular: false
  }
];

const apiFeatures = [
  {
    icon: Code,
    title: 'API RESTful',
    desc: 'API đầy đủ và dễ sử dụng'
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    desc: 'Nhận thông báo thời gian thực'
  },
  {
    icon: Database,
    title: 'SDKs',
    desc: 'Thư viện cho PHP, Node.js, Python'
  },
  {
    icon: Shield,
    title: 'Môi trường Sandbox',
    desc: 'Test API trước khi triển khai'
  }
];

const tools = [
  'Mẫu tải lên hàng loạt Excel/CSV',
  'Dashboard phân tích chi tiết',
  'Công cụ tích hợp tùy chỉnh',
  'Báo cáo doanh thu và hiệu suất'
];

export function MerchantSection() {
  return (
    <section id="merchants" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏦 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Giải pháp cho Người bán</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tối ưu hóa quy trình giao hàng với các công cụ quản lý chuyên nghiệp và API mạnh mẽ
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className={`${feature.color} bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">💰 Các gói giá</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-4 ring-purple-200 transform scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="bg-purple-600 text-white text-center py-2 text-sm font-bold">
                    Phổ biến nhất
                  </div>
                )}
                <div className={`bg-gradient-to-br ${plan.color} p-6 text-white text-center`}>
                  <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                  <div className="text-4xl font-bold mb-1">{plan.price}</div>
                  <div className="text-sm opacity-90">VND mỗi đơn hàng</div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    Chọn gói {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* API & Technical Features */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
              <Code className="w-8 h-8 mr-3 text-purple-600" />
              Kỹ thuật tích hợp
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {apiFeatures.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <feature.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-3">🚀 Bắt đầu ngay</h4>
              <p className="text-sm text-purple-100 mb-4">
                Tài liệu API đầy đủ, SDK và hỗ trợ kỹ thuật 24/7
              </p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                Xem tài liệu API
              </button>
            </div>
          </div>

          {/* Tools & CTA */}
          <div className="space-y-8">
            {/* Tools */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-green-600" />
                Công cụ hỗ trợ
              </h3>
              <ul className="space-y-4">
                {tools.map((tool, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Sẵn sàng tối ưu hóa?</h3>
              <p className="text-purple-100 mb-6">
                Tham gia cùng hàng nghìn người bán đang tin tưởng FastDelivery
              </p>
              <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto">
                <Users className="mr-2" />
                Đăng ký Merchant ngay
              </button>
              
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-purple-100">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Miễn phí 30 ngày đầu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
