import { motion } from 'framer-motion';
import { Clock, Shield, MapPin, Smartphone, CreditCard, Headphones } from 'lucide-react';
import { Card } from '../ui/card';

const benefits = [
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Guaranteed delivery within 30 minutes for city center, 2-4 hours for other areas.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Comprehensive insurance, real-time GPS tracking, and driver identity verification.',
    color: 'text-secondary'
  },
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    description: 'Track your order location in real-time with interactive maps and instant notifications.',
    color: 'text-accent'
  },
  {
    icon: Smartphone,
    title: 'User-friendly App',
    description: 'Simple interface, easy to use on all devices with optimized user experience.',
    color: 'text-primary'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Multiple payment methods supported: cash, bank transfer, e-wallet.',
    color: 'text-secondary'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Professional customer care team, ready to assist anytime, anywhere.',
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
            Why choose <span className="text-primary">FastDelivery</span>?
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            We provide comprehensive delivery solutions with modern technology 
            and professional service, ensuring the best experience for all customers.
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
                <div className="text-light-grey">Successful delivery rate</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-secondary mb-2">
                  25 min
                </div>
                <div className="text-light-grey">Average delivery time</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">
                  50,000+
                </div>
                <div className="text-light-grey">Orders delivered</div>
              </div>
              
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  4.9/5
                </div>
                <div className="text-light-grey">Customer rating</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
