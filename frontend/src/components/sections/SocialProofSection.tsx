import { Star, Quote, Shield, Clock, Award } from 'lucide-react';

const stats = [
  { value: '50,000+', label: 'Đơn hàng thành công', icon: Award },
  { value: '1,000+', label: 'Người bán tin tưởng', icon: Star },
  { value: '500+', label: 'Tài xế hoạt động', icon: Clock },
  { value: '4.9/5', label: 'Đánh giá trung bình', icon: Shield }
];

const testimonials = [
  {
    name: 'Nguyễn Thị Lan',
    role: 'Chủ shop thời trang',
    rating: 5,
    orders: '2,500+ đơn',
    comment: 'FastDelivery giúp tôi tiết kiệm rất nhiều thời gian và chi phí. Khách hàng luôn hài lòng với tốc độ giao hàng.',
    avatar: '👩‍💼'
  },
  {
    name: 'Trần Văn Minh',
    role: 'Tài xế FastDelivery',
    rating: 5,
    orders: '1,800+ chuyến',
    comment: 'Làm việc với FastDelivery giúp tôi có thu nhập ổn định và linh hoạt thời gian. Ứng dụng rất dễ sử dụng.',
    avatar: '👨‍🚗'
  },
  {
    name: 'Lê Thị Hương',
    role: 'Khách hàng cá nhân',
    rating: 5,
    orders: '150+ đơn',
    comment: 'Dịch vụ giao hàng nhanh và đáng tin cậy. Tôi đặc biệt thích tính năng theo dõi đơn hàng thời gian thực.',
    avatar: '👩'
  },
  {
    name: 'Phạm Đào Quân',
    role: 'Quản lý cửa hàng',
    rating: 5,
    orders: '3,200+ đơn',
    comment: 'API của FastDelivery rất mạnh mẽ, giúp chúng tôi tích hợp dễ dàng vào hệ thống quản lý.',
    avatar: '👨‍💻'
  },
  {
    name: 'Vũ Thị Mai',
    role: 'Tài xế bán thời gian',
    rating: 5,
    orders: '800+ chuyến',
    comment: 'Làm việc bán thời gian với FastDelivery giúp tôi có thêm thu nhập mà vẫn linh hoạt thời gian.',
    avatar: '👩‍🦱'
  },
  {
    name: 'Hoàng Văn Tùng',
    role: 'Chủ nhà hàng',
    rating: 5,
    orders: '5,000+ đơn',
    comment: 'Dịch vụ giao đồ ăn nhanh và giữ nhiệt độ tốt. Khách hàng rất hài lòng với chất lượng dịch vụ.',
    avatar: '👨‍🍳'
  }
];

const partners = [
  { name: 'Shopee', logo: '🛒' },
  { name: 'Lazada', logo: '🛍️' },
  { name: 'Tiki', logo: '📦' },
  { name: 'Sendo', logo: '🏪' },
  { name: 'Grab', logo: '🚗' },
  { name: 'Now', logo: '⚡' }
];

const trustBadges = [
  {
    icon: Award,
    title: 'Tỷ lệ thành công 99.8%',
    desc: 'Giao hàng đúng hẹn và an toàn'
  },
  {
    icon: Clock,
    title: 'Hỗ trợ 24/7',
    desc: 'Luôn sẵn sàng hỗ trợ khách hàng'
  },
  {
    icon: Shield,
    title: 'Chứng nhận bảo mật ISO 27001',
    desc: 'Bảo vệ thông tin khách hàng tối ưu'
  }
];

export function SocialProofSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🌟 <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Khách hàng tin tưởng</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hàng nghìn khách hàng, tài xế và người bán đã tin tưởng và sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-700 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">💬 Lời chứng thực từ khách hàng</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{testimonial.orders}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                  <p className="text-gray-700 italic pl-6">"{testimonial.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">🤝 Đối tác tích hợp</h3>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
              {partners.map((partner, index) => (
                <div key={index} className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-6xl mb-2">{partner.logo}</div>
                  <p className="text-sm font-semibold text-gray-600">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white">
          <h3 className="text-3xl font-bold text-center mb-8">🏆 Huy hiệu tin cậy</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <badge.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-2">{badge.title}</h4>
                <p className="text-blue-100">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
