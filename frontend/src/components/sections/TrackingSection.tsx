import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, User, Phone, CheckCircle, Truck, Package, Bell } from 'lucide-react';

const demoTracking = {
  orderId: 'FD240110001',
  status: 'delivering',
  driver: {
    name: 'John Doe',
    phone: '0901234567',
    rating: 4.8,
    vehicle: 'Honda Wave - 29A1-12345'
  },
  timeline: [
    { status: 'confirmed', time: '14:30', desc: 'Order confirmed', completed: true },
    { status: 'picked', time: '14:45', desc: 'Driver picked up package', completed: true },
    { status: 'delivering', time: '15:10', desc: 'Out for delivery', completed: true },
    { status: 'delivered', time: '15:30', desc: 'Delivered successfully', completed: false }
  ],
  estimatedTime: '15:30',
  currentLocation: 'Moving on Nguyen Trai Street'
};

export function TrackingSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    if (showDemo) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoTracking.timeline.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showDemo]);
  
  const handleSearch = () => {
    if (trackingCode.trim()) {
      setShowDemo(true);
    }
  };

  return (
    <section id="tracking" className="py-20 px-4 bg-gradient-to-br from-blue-600 to-cyan-600">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            📱 <span className="text-yellow-300">Track Your Order</span>
          </h2>
          <p className="text-white/90 mb-8 text-xl max-w-3xl mx-auto">
            Track your order in real-time with order code or phone number
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Search Form */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">🔍 Track Order</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter order code (e.g. FD240110001)..."
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Search className="mr-2" />
                  Track Now
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">✨ Tracking Features</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-yellow-300" />
                  <span>Real-time GPS tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-yellow-300" />
                  <span>Instant SMS/Email notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-yellow-300" />
                  <span>Complete delivery history</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-yellow-300" />
                  <span>Driver info and contact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Tracking Result */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {!showDemo ? (
              <div className="text-center py-12">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 mb-2">Tracking Demo</h3>
                <p className="text-gray-500 mb-6">Enter order code to see live tracking demo</p>
                <button 
                  onClick={() => {setTrackingCode('FD240110001'); setShowDemo(true);}}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  View Demo
                </button>
              </div>
            ) : (
              <div>
                {/* Order Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Order #{demoTracking.orderId}</h3>
                      <p className="text-green-600 font-semibold flex items-center mt-1">
                        <Truck className="w-4 h-4 mr-1" />
                        Out for Delivery
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Estimated:</p>
                      <p className="text-lg font-bold text-blue-600">{demoTracking.estimatedTime}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {demoTracking.currentLocation}
                  </p>
                </div>

                {/* Driver Info */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Driver Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{demoTracking.driver.name}</p>
                      <p className="text-sm text-gray-600">{demoTracking.driver.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end text-sm text-gray-600 mb-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {demoTracking.driver.phone}
                      </p>
                      <p className="text-sm text-yellow-600 font-semibold">⭐ {demoTracking.driver.rating}/5</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Delivery Progress
                  </h4>
                  {demoTracking.timeline.map((step, index) => (
                    <div key={index} className={`flex items-start space-x-4 pb-4 ${
                      index < demoTracking.timeline.length - 1 ? 'border-l-2 border-gray-200 ml-3' : ''
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed || index <= currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed || index <= currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className={`font-semibold ${
                            step.completed || index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.desc}
                          </p>
                          <span className={`text-sm ${
                            step.completed || index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
