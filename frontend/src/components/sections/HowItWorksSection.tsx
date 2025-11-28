import { motion } from 'framer-motion';
import { Package, MapPin, Truck, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';

const steps = [
  {
    icon: Package,
    title: 'Easy Ordering',
    description: 'Just a few simple steps to create an order. Enter address, select service and see price instantly.',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    number: '01'
  },
  {
    icon: MapPin,
    title: 'Confirm Information',
    description: 'Carefully check pickup/delivery addresses and contact info. Choose the most suitable delivery time.',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    number: '02'
  },
  {
    icon: Truck,
    title: 'Driver Pickup',
    description: 'AI automatically finds the nearest suitable driver. Track journey in real-time via GPS.',
    color: 'from-green-500 to-green-600',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    number: '03'
  },
  {
    icon: CheckCircle,
    title: 'Successful Delivery',
    description: 'Receive safely, flexible payment and rate experience. Complete in minutes.',
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    number: '04'
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-slate-50 to-background">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            ⚡ Optimized Process
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            Delivery in just
            <span className="block text-primary mt-2">
              4 simple steps
            </span>
          </h2>
          <p className="text-xl text-light-grey max-w-2xl mx-auto leading-relaxed">
            From ordering to receiving, everything is designed to deliver the smoothest and most convenient experience.
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Simple connecting line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 via-green-300 to-orange-300 opacity-40"></div>
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: index * 0.15, type: "spring", bounce: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Floating number */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      {step.number}
                    </div>
                  </div>
                  
                  <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 mt-8 group-hover:bg-white relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    <div className="relative z-10 text-center space-y-6">
                      <div className={`inline-flex p-4 rounded-2xl ${step.iconBg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-2xl font-heading font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-light-grey leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 p-6 overflow-hidden group">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 flex items-start space-x-5">
                  {/* Icon with number */}
                  <div className="flex-shrink-0 relative">
                    <div className={`p-4 rounded-2xl ${step.iconBg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                      <span className="text-sm font-bold text-foreground">{step.number}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-light-grey leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Animated connecting line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-6">
                  <div className="relative">
                    <div className="w-px h-12 bg-gradient-to-b from-gray-200 to-gray-300"></div>
                    <div className="absolute inset-0 w-px bg-gradient-to-b from-primary to-secondary animate-pulse"></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <Card className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 backdrop-blur-xl border-0 shadow-2xl p-12 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary/20 to-transparent rounded-full translate-x-20 translate-y-20"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                Start today!
              </h3>
              <p className="text-xl text-light-grey mb-8 max-w-2xl mx-auto leading-relaxed">
                Thousands of customers trust FastDelivery. 
                Join us and experience the difference.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🚀 Create Order Now
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/80 backdrop-blur-sm text-foreground px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:border-primary/50 transition-all duration-300"
                >
                  📱 Download App
                </motion.button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-light-grey">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>99.8% success</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>10K+ orders/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
