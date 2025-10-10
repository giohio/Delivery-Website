import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const faqs = [
  {
    category: 'Khách hàng',
    questions: [
      {
        question: 'Làm thế nào để tạo đơn hàng?',
        answer: 'Bạn có thể tạo đơn hàng qua website, ứng dụng mobile hoặc gọi hotline. Chỉ cần nhập địa chỉ gửi, nhận và thông tin hàng hóa, hệ thống sẽ tự động tính phí và phân công tài xế.'
      },
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Thời gian giao hàng phụ thuộc vào gói dịch vụ: Tiêu chuẩn (2-4h), Nhanh (1-2h), Siêu tốc (30-60 phút). Thời gian có thể thay đổi tùy theo khoảng cách và điều kiện giao thông.'
      },
      {
        question: 'Có thể thanh toán bằng cách nào?',
        answer: 'Chúng tôi hỗ trợ thanh toán tiền mặt, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), thẻ tín dụng/ghi nợ và thu hộ COD.'
      },
      {
        question: 'Làm sao để theo dõi đơn hàng?',
        answer: 'Bạn có thể theo dõi đơn hàng real-time qua website hoặc app bằng mã đơn hàng. Hệ thống sẽ gửi thông báo SMS/email khi có cập nhật trạng thái.'
      }
    ]
  },
  {
    category: 'Tài xế',
    questions: [
      {
        question: 'Điều kiện để trở thành tài xế?',
        answer: 'Bạn cần từ 18-55 tuổi, có GPLX hạng A1 trở lên, phương tiện giao thông, điện thoại thông minh và cam kết làm việc tối thiểu 20h/tuần.'
      },
      {
        question: 'Thu nhập của tài xế như thế nào?',
        answer: 'Thu nhập dao động từ 500k-1.5M VNĐ/ngày tùy theo số đơn và cấp độ. Có hệ thống thưởng theo hiệu suất và các chương trình khuyến khích.'
      },
      {
        question: 'Có hỗ trợ phương tiện không?',
        answer: 'Có, chúng tôi có chương trình cho thuê xe với giá ưu đãi, bảo hiểm toàn diện và hỗ trợ bảo dưỡng định kỳ.'
      },
      {
        question: 'Thời gian làm việc có linh hoạt không?',
        answer: 'Hoàn toàn linh hoạt. Bạn có thể tự chọn ca làm việc phù hợp, chỉ cần đảm bảo cam kết tối thiểu 20h/tuần.'
      }
    ]
  },
  {
    category: 'Merchant',
    questions: [
      {
        question: 'Làm thế nào để tích hợp API?',
        answer: 'Chúng tôi cung cấp RESTful API với tài liệu đầy đủ, SDK cho các ngôn ngữ phổ biến và sandbox environment để test. Đội ngũ kỹ thuật sẽ hỗ trợ tích hợp.'
      },
      {
        question: 'Có thể upload đơn hàng hàng loạt không?',
        answer: 'Có, bạn có thể upload hàng trăm đơn hàng cùng lúc qua file Excel hoặc CSV. Hệ thống sẽ tự động xử lý và phân công tài xế.'
      },
      {
        question: 'Báo cáo và thống kê như thế nào?',
        answer: 'Dashboard cung cấp báo cáo chi tiết về doanh thu, chi phí, tỷ lệ giao hàng thành công, đánh giá khách hàng theo thời gian thực.'
      },
      {
        question: 'Chính sách giá cho merchant?',
        answer: 'Giá giảm dần theo khối lượng: 0-100 đơn (18k), 101-500 đơn (16k), 500+ đơn (14k). Có các gói dịch vụ và tính năng khác nhau.'
      }
    ]
  }
];

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('Khách hàng');
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const currentFAQs = faqs.find(faq => faq.category === activeCategory)?.questions || [];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Câu hỏi <span className="text-primary">thường gặp</span>
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            Tìm câu trả lời cho những thắc mắc phổ biến về dịch vụ FastDelivery.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Danh mục
              </h3>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <Button
                    key={index}
                    variant={activeCategory === faq.category ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeCategory === faq.category 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-light-grey hover:text-foreground hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveCategory(faq.category);
                      setOpenQuestions([]);
                    }}
                  >
                    {faq.category}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="space-y-4">
              {currentFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm">
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="text-lg font-heading font-semibold text-foreground pr-4">
                        {faq.question}
                      </h4>
                      <div className="flex-shrink-0">
                        {openQuestions.includes(index) ? (
                          <Minus className="w-5 h-5 text-primary" />
                        ) : (
                          <Plus className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                    
                    {openQuestions.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-6 pt-4">
                          <p className="text-light-grey leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-lg border border-primary/30 p-8 text-center shadow-sm">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Không tìm thấy câu trả lời?
            </h3>
            <p className="text-light-grey mb-6">
              Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Chat với chúng tôi
              </Button>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Gọi hotline: 1900 1234
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
