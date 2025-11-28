import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Clock, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';

export function HeroSection() {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = 'Super Fast Delivery';
  
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [service, setService] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  const calculatePrice = () => {
    if (!fromAddress || !toAddress || !weight || !service) return;
    
    const basePrice = 15000; // 15k VND base
    const weightMultiplier = parseFloat(weight) * 2000; // 2k per kg
    const serviceMultiplier = service === 'express' ? 1.5 : service === 'same-day' ? 2 : 1;
    
    const total = (basePrice + weightMultiplier) * serviceMultiplier;
    setEstimatedPrice(total);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-slate-50 to-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(25,118,210,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(25,118,210,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-secondary to-transparent transform -rotate-45 opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6"
            >
              {displayText}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-primary"
              >
                |
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl text-light-grey mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Fast, safe, and convenient delivery service. 
              Connecting customers, drivers, and merchants in one unified platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold"
              >
                Create Order
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-light-grey">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-light-grey">Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">30 min</div>
                <div className="text-sm text-light-grey">Average</div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Price estimation form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Estimate Cost
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-grey mb-2">
                    Pickup Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-light-grey" />
                    <Input
                      placeholder="Enter pickup address"
                      value={fromAddress}
                      onChange={(e) => setFromAddress(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-foreground placeholder:text-light-grey"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-grey mb-2">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-light-grey" />
                    <Input
                      placeholder="Enter delivery address"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-foreground placeholder:text-light-grey"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-grey mb-2">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 w-4 h-4 text-light-grey" />
                      <Input
                        type="number"
                        placeholder="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-foreground placeholder:text-light-grey"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-grey mb-2">
                      Service
                    </label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger className="bg-white border-gray-300 text-foreground">
                        <Clock className="w-4 h-4 text-light-grey mr-2" />
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (2-4h)</SelectItem>
                        <SelectItem value="express">Express (1-2h)</SelectItem>
                        <SelectItem value="same-day">Same Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={calculatePrice}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!fromAddress || !toAddress || !weight || !service}
                >
                  Calculate Cost
                </Button>

                {estimatedPrice && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center"
                  >
                    <div className="text-sm text-light-grey">Estimated Cost</div>
                    <div className="text-2xl font-bold text-primary">
                      {estimatedPrice.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
