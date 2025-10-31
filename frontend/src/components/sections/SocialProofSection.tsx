import { Star, Quote, Shield, Clock, Award } from 'lucide-react';

const stats = [
  { value: '50,000+', label: 'Successful Deliveries', icon: Award },
  { value: '1,000+', label: 'Trusted Merchants', icon: Star },
  { value: '500+', label: 'Active Drivers', icon: Clock },
  { value: '4.9/5', label: 'Average Rating', icon: Shield }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fashion Store Owner',
    rating: 5,
    orders: '2,500+ orders',
    comment: 'FastDelivery saves me a lot of time and costs. Customers are always happy with the delivery speed.',
    avatar: '👩‍💼'
  },
  {
    name: 'Michael Chen',
    role: 'FastDelivery Driver',
    rating: 5,
    orders: '1,800+ trips',
    comment: 'Working with FastDelivery gives me stable income and flexible schedule. The app is very easy to use.',
    avatar: '👨‍🚗'
  },
  {
    name: 'Emily Wong',
    role: 'Individual Customer',
    rating: 5,
    orders: '150+ orders',
    comment: 'Fast and reliable delivery service. I especially love the real-time order tracking feature.',
    avatar: '👩'
  },
  {
    name: 'David Park',
    role: 'Store Manager',
    rating: 5,
    orders: '3,200+ orders',
    comment: 'FastDelivery API is very powerful, making it easy to integrate into our management system.',
    avatar: '👨‍💻'
  },
  {
    name: 'Lisa Nguyen',
    role: 'Part-time Driver',
    rating: 5,
    orders: '800+ trips',
    comment: 'Part-time work with FastDelivery gives me extra income while maintaining flexible schedule.',
    avatar: '👩‍🦱'
  },
  {
    name: 'James Lee',
    role: 'Restaurant Owner',
    rating: 5,
    orders: '5,000+ orders',
    comment: 'Fast food delivery service that maintains temperature well. Customers are very satisfied with service quality.',
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
    title: '99.8% Success Rate',
    desc: 'On-time and safe delivery'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    desc: 'Always ready to assist customers'
  },
  {
    icon: Shield,
    title: 'ISO 27001 Security Certified',
    desc: 'Optimal customer information protection'
  }
];

export function SocialProofSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🌟 <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Trusted by Customers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thousands of customers, drivers and merchants trust and use our service
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
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">💬 Customer Testimonials</h3>
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
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">🤝 Integration Partners</h3>
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
          <h3 className="text-3xl font-bold text-center mb-8">🏆 Trust Badges</h3>
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
