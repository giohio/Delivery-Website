import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const faqs = [
  {
    category: 'Customer',
    questions: [
      {
        question: 'How to create an order?',
        answer: 'You can create orders via website, mobile app or call hotline. Just enter pickup/delivery addresses and goods info, the system will auto-calculate fees and assign drivers.'
      },
      {
        question: 'How long is delivery time?',
        answer: 'Delivery time depends on service package: Standard (2-4h), Fast (1-2h), Express (30-60 min). Time may vary based on distance and traffic conditions.'
      },
      {
        question: 'What payment methods are available?',
        answer: 'We support cash, bank transfer, e-wallets (MoMo, ZaloPay, VNPay), credit/debit cards and COD collection.'
      },
      {
        question: 'How to track my order?',
        answer: 'You can track orders real-time via website or app using order code. System will send SMS/email notifications when status updates.'
      }
    ]
  },
  {
    category: 'Driver',
    questions: [
      {
        question: 'Requirements to become a driver?',
        answer: 'Must be 18-55 years old, have motorcycle license or higher, own vehicle, smartphone and commit to minimum 20h/week.'
      },
      {
        question: 'How much do drivers earn?',
        answer: 'Income ranges from 500k-1.5M VND/day depending on orders and level. Performance bonuses and incentive programs available.'
      },
      {
        question: 'Is vehicle support available?',
        answer: 'Yes, we have vehicle rental program with preferential prices, comprehensive insurance and periodic maintenance support.'
      },
      {
        question: 'Are working hours flexible?',
        answer: 'Completely flexible. You can choose suitable shifts, just ensure minimum 20h/week commitment.'
      }
    ]
  },
  {
    category: 'Merchant',
    questions: [
      {
        question: 'How to integrate API?',
        answer: 'We provide RESTful API with full documentation, SDKs for popular languages and sandbox environment for testing. Technical team will support integration.'
      },
      {
        question: 'Can I bulk upload orders?',
        answer: 'Yes, you can upload hundreds of orders at once via Excel or CSV file. System will auto-process and assign drivers.'
      },
      {
        question: 'How are reports and statistics?',
        answer: 'Dashboard provides detailed reports on revenue, costs, delivery success rate, customer ratings in real-time.'
      },
      {
        question: 'Pricing policy for merchants?',
        answer: 'Volume-based pricing: 0-100 orders (18k), 101-500 orders (16k), 500+ orders (14k). Various service packages and features available.'
      }
    ]
  }
];

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('Customer');
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
            Frequently <span className="text-primary">Asked Questions</span>
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            Find answers to common questions about FastDelivery service.
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
                Categories
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
              Can't find the answer?
            </h3>
            <p className="text-light-grey mb-6">
              Our customer support team is always ready to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Chat with us
              </Button>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Call hotline: 1900 1234
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
