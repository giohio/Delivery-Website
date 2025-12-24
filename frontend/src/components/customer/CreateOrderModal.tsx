import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Package, Bike, Car, Truck, Phone, Tag, Percent } from 'lucide-react';
import { orderApi, CreateOrderRequest } from '../../services/orderApi';
import { couponApi, Coupon } from '../../services/couponApi';

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess: (orderData?: any) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateOrderRequest>({
    pickup_address: '',
    delivery_address: '',
    distance_km: 0,
    price_estimate: 0,
    payment_method: 'cash',
    service_type: 'bike',
    package_size: 'small',
    pickup_lat: 0,
    pickup_lng: 0,
    delivery_lat: 0,
    delivery_lng: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectingLocation, setSelectingLocation] = useState<'pickup' | 'delivery' | null>(null);
  const [weather, setWeather] = useState<string>('');
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupDebounceRef = useRef<any>(null);
  const deliveryDebounceRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const L = (window as any).L;
      const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    loadLeaflet();
  }, []);

  // Handle map click separately
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    const handleMapClick = async (e: any) => {
      const { lat, lng } = e.latlng;
      
      if (selectingLocation === 'pickup') {
        setPickupCoords({ lat, lng });
        setFormData(prev => ({ ...prev, pickup_lat: lat, pickup_lng: lng }));
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          setFormData(prev => ({ ...prev, pickup_address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        } catch (err) {
          setFormData(prev => ({ ...prev, pickup_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        }
        
        // Remove old marker if exists
        if ((window as any).pickupMarker) {
          map.removeLayer((window as any).pickupMarker);
        }
        
        // Create new marker
        (window as any).pickupMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })
        }).addTo(map);
        
        console.log('Pickup marker created at:', lat, lng);
        setSelectingLocation(null);
      } else if (selectingLocation === 'delivery') {
        setDeliveryCoords({ lat, lng });
        setFormData(prev => ({ ...prev, delivery_lat: lat, delivery_lng: lng }));
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          setFormData(prev => ({ ...prev, delivery_address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        } catch (err) {
          setFormData(prev => ({ ...prev, delivery_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        }
        
        // Remove old marker if exists
        if ((window as any).deliveryMarker) {
          map.removeLayer((window as any).deliveryMarker);
        }
        
        // Create new marker
        (window as any).deliveryMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })
        }).addTo(map);
        
        console.log('Delivery marker created at:', lat, lng);
        setSelectingLocation(null);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [selectingLocation]);

  // Auto-geocode pickup address when typed
  const handlePickupAddressChange = (address: string) => {
    setFormData({ ...formData, pickup_address: address });
    
    if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current);
    
    if (address.length > 5) {
      setIsGeocodingPickup(true);
      pickupDebounceRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setPickupCoords({ lat, lng });
            setFormData(prev => ({ ...prev, pickup_lat: lat, pickup_lng: lng }));
            
            if (mapInstanceRef.current && (window as any).L) {
              const L = (window as any).L;
              
              // Remove old marker if exists
              if ((window as any).pickupMarker) {
                mapInstanceRef.current.removeLayer((window as any).pickupMarker);
              }
              
              // Create new marker
              (window as any).pickupMarker = L.marker([lat, lng], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }).addTo(mapInstanceRef.current);
              
              console.log('Pickup marker created via geocoding at:', lat, lng);
              mapInstanceRef.current.setView([lat, lng], 13);
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        } finally {
          setIsGeocodingPickup(false);
        }
      }, 1000);
    }
  };

  // Auto-geocode delivery address when typed
  const handleDeliveryAddressChange = (address: string) => {
    setFormData({ ...formData, delivery_address: address });
    
    if (deliveryDebounceRef.current) clearTimeout(deliveryDebounceRef.current);
    
    if (address.length > 5) {
      setIsGeocodingDelivery(true);
      deliveryDebounceRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setDeliveryCoords({ lat, lng });
            setFormData(prev => ({ ...prev, delivery_lat: lat, delivery_lng: lng }));
            
            if (mapInstanceRef.current && (window as any).L) {
              const L = (window as any).L;
              
              // Remove old marker if exists
              if ((window as any).deliveryMarker) {
                mapInstanceRef.current.removeLayer((window as any).deliveryMarker);
              }
              
              // Create new marker
              (window as any).deliveryMarker = L.marker([lat, lng], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }).addTo(mapInstanceRef.current);
              
              console.log('Delivery marker created via geocoding at:', lat, lng);
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        } finally {
          setIsGeocodingDelivery(false);
        }
      }, 1000);
    }
  };

  // Calculate distance and draw route when both coords are set
  useEffect(() => {
    if (pickupCoords && deliveryCoords && mapInstanceRef.current) {
      const L = (window as any).L;
      const pickup = L.latLng(pickupCoords.lat, pickupCoords.lng);
      const delivery = L.latLng(deliveryCoords.lat, deliveryCoords.lng);
      const distance = pickup.distanceTo(delivery) / 1000;
      setFormData(prev => ({ ...prev, distance_km: parseFloat(distance.toFixed(2)) }));
      
      // Draw route line
      if ((window as any).routeLine) {
        mapInstanceRef.current.removeLayer((window as any).routeLine);
      }
      (window as any).routeLine = L.polyline([
        [pickupCoords.lat, pickupCoords.lng],
        [deliveryCoords.lat, deliveryCoords.lng]
      ], {
        color: '#3B82F6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(mapInstanceRef.current);
      
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [deliveryCoords.lat, deliveryCoords.lng]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      
      // Fetch weather for pickup location
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pickupCoords.lat}&lon=${pickupCoords.lng}&appid=YOUR_API_KEY`)
        .then(res => res.json())
        .then(data => {
          if (data.weather && data.weather[0]) {
            setWeather(data.weather[0].main.toLowerCase());
          }
        })
        .catch(() => setWeather('clear'));
    }
  }, [pickupCoords, deliveryCoords]);

  // Calculate price
  useEffect(() => {
    if (formData.distance_km && formData.distance_km > 0) {
      const basePrice = formData.service_type === 'bike' ? 10000 : 
                       formData.service_type === 'car' ? 20000 : 50000;
      const pricePerKm = formData.service_type === 'bike' ? 5000 : 
                        formData.service_type === 'car' ? 8000 : 15000;
      const packageSurcharge = formData.package_size === 'medium' ? 5000 : 
                              formData.package_size === 'large' ? 10000 : 0;
      const weatherSurcharge = weather === 'rain' ? 5000 : 
                              weather === 'storm' ? 10000 : 0;
      
      const total = basePrice + (formData.distance_km * pricePerKm) + packageSurcharge + weatherSurcharge;
      setFormData(prev => ({ ...prev, price_estimate: Math.round(total) }));
      
      // Re-validate coupon if applied
      if (appliedCoupon) {
        handleValidateCoupon(appliedCoupon.code, total);
      }
    }
  }, [formData.distance_km, formData.service_type, formData.package_size, weather]);

  // Load available coupons
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await couponApi.getAvailableCoupons();
        setAvailableCoupons(response.coupons || []);
      } catch (error) {
        console.error('Failed to load coupons:', error);
      }
    };
    loadCoupons();
  }, []);

  // Validate coupon
  const handleValidateCoupon = async (code: string, orderAmount?: number) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const amount = orderAmount || formData.price_estimate;
    if (!amount || amount <= 0) {
      setCouponError('Please calculate order price first');
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError('');
      
      const response = await couponApi.validateCoupon(code.toUpperCase(), amount);
      
      if (response.valid) {
        const coupon = availableCoupons.find(c => c.code === code.toUpperCase());
        setAppliedCoupon(coupon || null);
        setCouponDiscount(response.discount || 0);
        setCouponError('');
        setCouponCode(code.toUpperCase());
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(response.message || 'Invalid coupon');
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(error.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  // Apply coupon from list
  const handleSelectCoupon = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    handleValidateCoupon(coupon.code);
    setShowCoupons(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = await orderApi.createOrder(formData);
      onSuccess(orderData);
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to create order. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please logout and login again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.pickup_address || !formData.delivery_address) {
        setError('Please enter both pickup and delivery addresses');
        return;
      }
      if (!pickupCoords || !deliveryCoords) {
        setError('Please select locations on the map by clicking the Map buttons');
        return;
      }
      if (!formData.distance_km || formData.distance_km <= 0) {
        setError('Cannot calculate distance. Please select valid locations.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-gray-900">Create New Order</h3>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Package className="w-4 h-4" />
                Details
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid lg:grid-cols-[1fr,600px] gap-6 p-6">
            {/* Left - Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Step 1: Addresses */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Pickup Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Pickup Address
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          required
                          value={formData.pickup_address}
                          onChange={(e) => handlePickupAddressChange(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          placeholder="Type address (auto-geocode)"
                        />
                        {isGeocodingPickup && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectingLocation(selectingLocation === 'pickup' ? null : 'pickup')}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          selectingLocation === 'pickup' 
                            ? 'bg-green-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📍 Map
                      </button>
                    </div>
                    {pickupCoords && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Navigation className="w-4 h-4 inline mr-2" />
                      Delivery Address
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          required
                          value={formData.delivery_address}
                          onChange={(e) => handleDeliveryAddressChange(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          placeholder="Type address (auto-geocode)"
                        />
                        {isGeocodingDelivery && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectingLocation(selectingLocation === 'delivery' ? null : 'delivery')}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          selectingLocation === 'delivery' 
                            ? 'bg-red-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        📍 Map
                      </button>
                    </div>
                    {deliveryCoords && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {deliveryCoords.lat.toFixed(6)}, {deliveryCoords.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Distance Display */}
                  {formData.distance_km && formData.distance_km > 0 && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">📏 Distance</span>
                          <span className="text-xl font-bold text-blue-600">{formData.distance_km} km</span>
                        </div>
                      </div>
                      
                      {/* Quick Price Preview */}
                      {formData.price_estimate && formData.price_estimate > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">💰 Estimated Price</span>
                            <span className="text-2xl font-bold text-green-600">
                              {formData.price_estimate.toLocaleString()} ₫
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Based on bike service • You can change service type in next step
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    ← Back to addresses
                  </button>

                  {/* Service Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      🚚 Service Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, service_type: 'bike'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.service_type === 'bike'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Bike className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-bold">Bike</div>
                        <div className="text-xs text-gray-600 mt-1">10K + 5K/km</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, service_type: 'car'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.service_type === 'car'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-bold">Car</div>
                        <div className="text-xs text-gray-600 mt-1">20K + 8K/km</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, service_type: 'truck'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.service_type === 'truck'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-bold">Truck</div>
                        <div className="text-xs text-gray-600 mt-1">50K + 15K/km</div>
                      </button>
                    </div>
                  </div>

                  {/* Package Size */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      📦 Package Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', icon: '📦', label: 'Small', weight: '≤5kg', size: '30×30×30cm', price: '+0' },
                        { value: 'medium', icon: '📦📦', label: 'Medium', weight: '5-15kg', size: '50×50×50cm', price: '+5K' },
                        { value: 'large', icon: '📦📦📦', label: 'Large', weight: '15-30kg', size: '80×80×80cm', price: '+10K' }
                      ].map((pkg) => (
                        <button
                          key={pkg.value}
                          type="button"
                          onClick={() => setFormData({...formData, package_size: pkg.value})}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.package_size === pkg.value
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{pkg.icon}</div>
                          <div className="text-sm font-bold">{pkg.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{pkg.weight}</div>
                          <div className="text-xs text-gray-600">{pkg.size}</div>
                          <div className="text-xs text-green-600 font-semibold mt-1">{pkg.price} VND</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Sender Name
                      </label>
                      <input
                        type="text"
                        value={formData.pickup_contact_name || ''}
                        onChange={(e) => setFormData({...formData, pickup_contact_name: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Sender name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Sender Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.pickup_contact_phone || ''}
                        onChange={(e) => setFormData({...formData, pickup_contact_phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0901234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Receiver Name
                      </label>
                      <input
                        type="text"
                        value={formData.delivery_contact_name || ''}
                        onChange={(e) => setFormData({...formData, delivery_contact_name: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Receiver name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Receiver Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.delivery_contact_phone || ''}
                        onChange={(e) => setFormData({...formData, delivery_contact_phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0907654321"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Special Notes
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none custom-scrollbar"
                      placeholder="Any special instructions..."
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Payment Method
                    </label>
                    <select
                      value={formData.payment_method || 'cash'}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="credit_card">💳 Credit Card</option>
                      <option value="e_wallet">📱 E-Wallet</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                    </select>
                  </div>

                  {/* Coupon Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-1" />
                      Promo Code / Coupon
                    </label>
                    
                    {!appliedCoupon ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                            disabled={validatingCoupon || !formData.price_estimate}
                          />
                          <button
                            type="button"
                            onClick={() => handleValidateCoupon(couponCode)}
                            disabled={validatingCoupon || !couponCode.trim() || !formData.price_estimate}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {validatingCoupon ? 'Checking...' : 'Apply'}
                          </button>
                        </div>
                        
                        {couponError && (
                          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {couponError}
                          </div>
                        )}
                        
                        {availableCoupons.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCoupons(!showCoupons)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Percent className="w-4 h-4" />
                            {showCoupons ? 'Hide' : 'View'} available coupons ({availableCoupons.length})
                          </button>
                        )}
                        
                        {showCoupons && (
                          <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                            {availableCoupons.map((coupon) => (
                              <div
                                key={coupon.coupon_id}
                                onClick={() => handleSelectCoupon(coupon)}
                                className="border-2 border-green-200 rounded-xl p-3 cursor-pointer hover:bg-green-50 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-green-700 text-lg">{coupon.code}</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {coupon.discount_type === 'percentage' 
                                      ? `-${coupon.discount_value}%` 
                                      : `-${Number(coupon.discount_value).toLocaleString('vi-VN')}₫`}
                                  </span>
                                </div>
                                {coupon.description && (
                                  <p className="text-xs text-gray-600 mb-1">{coupon.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Min: {Number(coupon.min_order_value || 0).toLocaleString('vi-VN')}₫</span>
                                  {coupon.max_discount && (
                                    <span>Max: {Number(coupon.max_discount).toLocaleString('vi-VN')}₫</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-700 text-lg">{appliedCoupon.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-green-700 font-semibold">
                            Discount: -{Number(couponDiscount).toLocaleString('vi-VN')}₫
                          </p>
                          {appliedCoupon.description && (
                            <p className="text-xs text-gray-600">{appliedCoupon.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weather Display */}
                  {weather && weather !== 'clear' && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">
                          {weather === 'rain' ? '🌧️ Rainy Weather' :
                           weather === 'thunderstorm' ? '⛈️ Thunderstorm' :
                           weather === 'snow' ? '❄️ Snowy Weather' :
                           '🌤️ Weather: ' + weather}
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-orange-700 font-medium">
                          Surcharge: +{weather === 'rain' ? '5,000' : weather === 'thunderstorm' ? '10,000' : weather === 'snow' ? '8,000' : '0'} VND
                        </p>
                        <p className="text-xs text-gray-600">
                          {weather === 'rain' ? '⚠️ Rainy conditions may slow delivery' :
                           weather === 'thunderstorm' ? '⚠️ Severe weather - delivery may be delayed' :
                           weather === 'snow' ? '⚠️ Snow conditions - extra care needed' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price Display */}
                  {formData.price_estimate && formData.price_estimate > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="space-y-3 mb-4">
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Base fare ({formData.service_type})</span>
                            <span>{(formData.service_type === 'bike' ? 10000 : formData.service_type === 'car' ? 20000 : 50000).toLocaleString('vi-VN')} ₫</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance ({formData.distance_km || 0} km)</span>
                            <span>{((formData.distance_km || 0) * (formData.service_type === 'bike' ? 5000 : formData.service_type === 'car' ? 8000 : 15000)).toLocaleString('vi-VN')} ₫</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Package size ({formData.package_size})</span>
                            <span>+{(formData.package_size === 'medium' ? 5000 : formData.package_size === 'large' ? 10000 : 0).toLocaleString('vi-VN')} ₫</span>
                          </div>
                          {weather && weather !== 'clear' && (
                            <div className="flex justify-between text-orange-600">
                              <span>Weather surcharge</span>
                              <span>+{(weather === 'rain' ? 5000 : weather === 'thunderstorm' ? 10000 : weather === 'snow' ? 8000 : 0).toLocaleString('vi-VN')} ₫</span>
                            </div>
                          )}
                          {appliedCoupon && couponDiscount > 0 && (
                            <div className="flex justify-between text-green-600 font-semibold pt-2 border-t border-gray-200">
                              <span className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                Coupon Discount ({appliedCoupon.code})
                              </span>
                              <span>-{Number(couponDiscount).toLocaleString('vi-VN')} ₫</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t-2 border-blue-300">
                        <span className="text-lg font-semibold text-gray-700">
                          {appliedCoupon && couponDiscount > 0 ? 'Final Price' : 'Total Price'}
                        </span>
                        <div className="text-right">
                          {appliedCoupon && couponDiscount > 0 && (
                            <div className="text-sm text-gray-500 line-through mb-1">
                              {Number(formData.price_estimate).toLocaleString('vi-VN')} ₫
                            </div>
                          )}
                          <span className="text-3xl font-bold text-blue-600">
                            {Number(Math.max(0, (formData.price_estimate || 0) - couponDiscount)).toLocaleString('vi-VN')} ₫
                          </span>
                          {appliedCoupon && couponDiscount > 0 && (
                            <div className="text-xs text-green-600 font-semibold mt-1">
                              You saved {Number(couponDiscount).toLocaleString('vi-VN')}₫!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {loading ? 'Creating...' : '✓ Create Order'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Right - Map */}
            <div className="space-y-3 lg:sticky lg:top-6 lg:h-fit">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    🗺️
                  </span>
                  Interactive Map
                </label>
                {selectingLocation && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium animate-pulse">
                    Click map to set {selectingLocation === 'pickup' ? '🟢 Pickup' : '🔴 Delivery'}
                  </span>
                )}
              </div>
              <div 
                ref={mapRef} 
                className="w-full rounded-2xl border-2 border-gray-300 shadow-lg overflow-hidden"
                style={{ height: '700px' }}
              />
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                💡 Click the <strong>📍 Map</strong> button next to each address field, then click on the map to select the location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
