import { motion } from 'framer-motion';
import { Car, DollarSign, Clock, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

const driverBenefits = [
  {
    icon: DollarSign,
    title: 'Attractive Income',
    description: 'Earn 500k - 1.5M VND/day with flexible bonus system',
    color: 'text-primary'
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Choose working hours that fit your personal schedule',
    color: 'text-secondary'
  },
  {
    icon: Car,
    title: 'Vehicle Support',
    description: 'Vehicle rental program with preferential prices and comprehensive insurance',
    color: 'text-accent'
  },
  {
    icon: Star,
    title: 'Performance Bonus',
    description: 'Fair rating system with achievement-based bonus levels',
    color: 'text-primary'
  }
];

const requirements = [
  'Age 18-55, motorcycle license or higher',
  'Own vehicle (motorcycle/car)',
  'Smartphone with GPS',
  'Good service attitude, honest',
  'Minimum 20h/week commitment'
];

const earnings = [
  { level: 'New', orders: '0-50', rate: '15,000', bonus: '0%' },
  { level: 'Bronze', orders: '51-200', rate: '17,000', bonus: '5%' },
  { level: 'Silver', orders: '201-500', rate: '20,000', bonus: '10%' },
  { level: 'Gold', orders: '500+', rate: '25,000', bonus: '15%' }
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
            Become a <span className="text-primary">Driver</span> at FastDelivery
          </h2>
          <p className="text-lg text-light-grey max-w-3xl mx-auto">
            Join our professional driver team. 
            Earn stable income with flexible working hours.
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
              Benefits of working with us
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
              Application Requirements
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
                Register as Driver
              </Button>
              
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Download Driver App
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
            Earnings by Level
          </h3>
          
          <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Level</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Orders</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Rate/Order</th>
                    <th className="px-6 py-4 text-left text-foreground font-semibold">Bonus</th>
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
                          earning.level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                          earning.level === 'Silver' ? 'bg-gray-500/20 text-gray-300' :
                          earning.level === 'Bronze' ? 'bg-orange-500/20 text-orange-400' :
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
                <div className="text-light-grey text-sm">Active Drivers</div>
              </div>
              
              <div className="space-y-2">
                <DollarSign className="w-8 h-8 text-secondary mx-auto" />
                <div className="text-2xl font-bold text-foreground">850K</div>
                <div className="text-light-grey text-sm">Avg Income/Day</div>
              </div>
              
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-accent mx-auto" />
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-light-grey text-sm">Satisfaction Rate</div>
              </div>
              
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-primary mx-auto" />
                <div className="text-2xl font-bold text-foreground">6h</div>
                <div className="text-light-grey text-sm">Avg Work/Day</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
