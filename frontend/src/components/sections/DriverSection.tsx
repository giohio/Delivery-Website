import { motion } from 'framer-motion';
import { Car, DollarSign, Clock, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

const driverBenefits = [
  {
    icon: DollarSign,
    title: 'Thu nhập hấp dẫn',
    description: 'Kiếm từ 500k - 1.5M VNĐ/ngày với hệ thống thưởng linh hoạt',
    color: 'text-primary'
  },
  {
    icon: Clock,
    title: 'Thời gian linh hoạt',
    description: 'Tự do lựa chọn giờ làm việc phù hợp với lịch trình cá nhân',
    color: 'text-secondary'
  },
  {
    icon: Car,
    title: 'Hỗ trợ phương tiện',
    description: 'Chương trình cho thuê xe với giá ưu đãi và bảo hiểm toàn diện',
    color: 'text-accent'
  },
  {
    icon: Star,
    title: 'Thưởng hiệu suất',
    description: 'Hệ thống đánh giá công bằng với các mức thưởng theo thành tích',
    color: 'text-primary'
  }
];

const requirements = [
  'Tuổi từ 18-55, có GPLX hạng A1 trở lên',
  'Có phương tiện giao thông (xe máy/ô tô)',
  'Điện thoại thông minh có GPS',
  'Thái độ phục vụ tốt, trung thực',
  'Cam kết làm việc tối thiểu 20h/tuần'
];

const earnings = [
  { level: 'Mới', orders: '0-50', rate: '15,000', bonus: '0%' },
  { level: 'Đồng', orders: '51-200', rate: '17,000', bonus: '5%' },
  { level: 'Bạc', orders: '201-500', rate: '20,000', bonus: '10%' },
  { level: 'Vàng', orders: '500+', rate: '25,000', bonus: '15%' }
];

export function DriverSection() {
  return (
    <section id="drivers" className="py-20 bg-gradient-to-b from-background to-slate-50">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Trở thành <span className="text-primary">Tài xế</span> FastDelivery
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            Tham gia đội ngũ tài xế chuyên nghiệp của chúng tôi. 
            Kiếm thu nhập ổn định với thời gian làm việc linh hoạt.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-heading font-bold text-foreground mb-8">
              Lợi ích khi làm việc cùng chúng tôi
            </h3>
            
            <div className="space-y-6">
              {driverBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 hover:border-primary/50 transition-all duration-300 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full bg-gray-50 ${benefit.color}`}>
                        <benefit.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-heading font-semibold text-foreground mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-light-grey text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-heading font-bold text-foreground mb-8">
              Yêu cầu ứng tuyển
            </h3>
            
            <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="space-y-4">
                {requirements.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-light-grey text-sm">
                      {requirement}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3">
                Đăng ký làm tài xế
              </Button>
              
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Tải ứng dụng tài xế
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Earnings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
            Bảng thu nhập theo cấp độ
          </h3>
          
          <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Cấp độ</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Số đơn</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Giá/đơn</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Thưởng thêm</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-t border-gray-200"
                    >
                      <td className="px-6 py-4">
                        <Badge className={`${
                          earning.level === 'Vàng' ? 'bg-yellow-500/20 text-yellow-400' :
                          earning.level === 'Bạc' ? 'bg-gray-500/20 text-gray-300' :
                          earning.level === 'Đồng' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {earning.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-light-grey">{earning.orders}</td>
                      <td className="px-6 py-4 text-primary font-semibold">{earning.rate} VNĐ</td>
                      <td className="px-6 py-4 text-secondary font-semibold">+{earning.bonus}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-lg border border-primary/30 p-8 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto" />
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-light-grey text-sm">Tài xế hoạt động</div>
              </div>
              
              <div className="space-y-2">
                <DollarSign className="w-8 h-8 text-secondary mx-auto" />
                <div className="text-2xl font-bold text-foreground">850K</div>
                <div className="text-light-grey text-sm">Thu nhập TB/ngày</div>
              </div>
              
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-accent mx-auto" />
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-light-grey text-sm">Tỷ lệ hài lòng</div>
              </div>
              
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-primary mx-auto" />
                <div className="text-2xl font-bold text-foreground">6h</div>
                <div className="text-light-grey text-sm">Làm việc TB/ngày</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
