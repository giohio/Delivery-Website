import { motion } from 'framer-motion';
import { Clock, Shield, MapPin, Smartphone, CreditCard, Headphones } from 'lucide-react';
import { Card } from '../ui/card';

const benefits = [
  {
    icon: Clock,
    title: 'Giao hàng nhanh chóng',
    description: 'Cam kết giao hàng trong 30 phút đối với khu vực nội thành, 2-4 giờ cho các khu vực khác.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'An toàn & bảo mật',
    description: 'Hệ thống bảo hiểm toàn diện, theo dõi GPS real-time và xác thực danh tính tài xế.',
    color: 'text-secondary'
  },
  {
    icon: MapPin,
    title: 'Theo dõi real-time',
    description: 'Theo dõi vị trí đơn hàng theo thời gian thực với bản đồ tương tác và thông báo tức thì.',
    color: 'text-accent'
  },
  {
    icon: Smartphone,
    title: 'Ứng dụng thân thiện',
    description: 'Giao diện đơn giản, dễ sử dụng trên mọi thiết bị với trải nghiệm người dùng tối ưu.',
    color: 'text-primary'
  },
  {
    icon: CreditCard,
    title: 'Thanh toán linh hoạt',
    description: 'Hỗ trợ đa dạng phương thức thanh toán: tiền mặt, chuyển khoản, ví điện tử.',
    color: 'text-secondary'
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ chăm sóc khách hàng chuyên nghiệp, sẵn sàng hỗ trợ mọi lúc mọi nơi.',
    color: 'text-accent'
  }
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-b from-background to-slate-50">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Tại sao chọn <span className="text-primary">FastDelivery</span>?
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            Chúng tôi mang đến giải pháp giao hàng toàn diện với công nghệ hiện đại 
            và dịch vụ chuyên nghiệp, đảm bảo trải nghiệm tốt nhất cho mọi khách hàng.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-lg border border-gray-200 p-6 hover:border-primary/50 transition-all duration-300 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-3 rounded-full bg-gray-50 ${benefit.color}`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-light-grey leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-lg border border-primary/30 p-8 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  99.36%
                </div>
                <div className="text-light-grey">Tỷ lệ giao hàng thành công</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-secondary mb-2">
                  25 phút
                </div>
                <div className="text-light-grey">Thời gian giao hàng trung bình</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">
                  50,000+
                </div>
                <div className="text-light-grey">Đơn hàng đã giao</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  4.9/5
                </div>
                <div className="text-light-grey">Đánh giá khách hàng</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
