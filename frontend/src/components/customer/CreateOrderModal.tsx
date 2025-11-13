import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, CreditCard, Map } from 'lucide-react';
import { orderApi, CreateOrderRequest } from '../../services/orderApi';

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess: (orderData?: any) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    pickup_address: '',
    delivery_address: '',
    distance_km: 0,
    price_estimate: 0,
    payment_method: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectingLocation, setSelectingLocation] = useState<'pickup' | 'delivery' | null>(null);
  const [weather, setWeather] = useState<string>('');
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupDebounceRef = useRef<any>(null);
  const deliveryDebounceRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const L = (window as any).L;
      
      // Create map centered on Ho Chi Minh City
      const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add click handler for selecting locations
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        
        if (selectingLocation === 'pickup') {
          setPickupCoords({ lat, lng });
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setFormData(prev => ({ ...prev, pickup_address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
          } catch (err) {
            setFormData(prev => ({ ...prev, pickup_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
          }
          
          // Add/update marker
          if ((window as any).pickupMarker) {
            (window as any).pickupMarker.setLatLng([lat, lng]);
          } else {
            (window as any).pickupMarker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }).addTo(map).bindPopup('Pickup Location');
          }
          
          setSelectingLocation(null);
        } else if (selectingLocation === 'delivery') {
          setDeliveryCoords({ lat, lng });
          
          // Reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setFormData(prev => ({ ...prev, delivery_address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
          } catch (err) {
            setFormData(prev => ({ ...prev, delivery_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
          }
          
          // Add/update marker
          if ((window as any).deliveryMarker) {
            (window as any).deliveryMarker.setLatLng([lat, lng]);
          } else {
            (window as any).deliveryMarker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }).addTo(map).bindPopup('Delivery Location');
          }
          
          setSelectingLocation(null);
        }
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectingLocation]);

  // Geocode address to coordinates
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return null;
  };

  // Get weather based on coordinates
  const getWeather = async (lat: number, lng: number) => {
    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      const data = await response.json();
      
      if (data.current_weather) {
        // Map weather codes to conditions
        const weatherCode = data.current_weather.weathercode;
        let condition = 'clear';
        
        if (weatherCode >= 51 && weatherCode <= 67) {
          condition = 'rain';
        } else if (weatherCode >= 71 && weatherCode <= 77) {
          condition = 'snow';
        } else if (weatherCode >= 80 && weatherCode <= 99) {
          condition = 'thunderstorm';
        }
        
        return condition;
      }
    } catch (err) {
      console.error('Weather API error:', err);
    }
    return 'clear';
  };

  // Calculate price based on distance and weather
  const calculatePriceWithWeather = (distance: number, weatherCondition: string) => {
    const baseFare = 10000;
    const ratePerKm = 5000;
    let weatherSurcharge = 0;

    if (weatherCondition === 'rain' || weatherCondition === 'drizzle') {
      weatherSurcharge = 5000;
    } else if (weatherCondition === 'thunderstorm') {
      weatherSurcharge = 10000;
    } else if (weatherCondition === 'snow') {
      weatherSurcharge = 8000;
    }

    return Math.round(baseFare + (distance * ratePerKm) + weatherSurcharge);
  };

  // Calculate distance when both coordinates are set
  useEffect(() => {
    if (pickupCoords && deliveryCoords) {
      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (deliveryCoords.lat - pickupCoords.lat) * Math.PI / 180;
      const dLon = (deliveryCoords.lng - pickupCoords.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pickupCoords.lat * Math.PI / 180) * Math.cos(deliveryCoords.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Get weather and calculate price
      const updatePriceWithWeather = async () => {
        const weatherCondition = await getWeather(pickupCoords.lat, pickupCoords.lng);
        setWeather(weatherCondition);
        const price = calculatePriceWithWeather(distance, weatherCondition);
        
        setFormData(prev => ({ 
          ...prev, 
          distance_km: parseFloat(distance.toFixed(2)),
          price_estimate: price
        }));
      };
      
      updatePriceWithWeather();
    }
  }, [pickupCoords, deliveryCoords]);

  // Handle pickup address change with debounce
  const handlePickupAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, pickup_address: address }));
    
    // Clear previous timeout
    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current);
    }
    
    // Set new timeout for geocoding
    if (address.length > 5) {
      setIsGeocodingPickup(true);
      pickupDebounceRef.current = setTimeout(async () => {
        const coords = await geocodeAddress(address);
        if (coords) {
          setPickupCoords(coords);
          
          // Update map marker
          if (mapInstanceRef.current && (window as any).L) {
            const L = (window as any).L;
            if ((window as any).pickupMarker) {
              (window as any).pickupMarker.setLatLng([coords.lat, coords.lng]);
            } else {
              (window as any).pickupMarker = L.marker([coords.lat, coords.lng], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }).addTo(mapInstanceRef.current).bindPopup('Pickup Location');
            }
            mapInstanceRef.current.setView([coords.lat, coords.lng], 13);
          }
        }
        setIsGeocodingPickup(false);
      }, 1000); // 1 second debounce
    }
  };

  // Handle delivery address change with debounce
  const handleDeliveryAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, delivery_address: address }));
    
    // Clear previous timeout
    if (deliveryDebounceRef.current) {
      clearTimeout(deliveryDebounceRef.current);
    }
    
    // Set new timeout for geocoding
    if (address.length > 5) {
      setIsGeocodingDelivery(true);
      deliveryDebounceRef.current = setTimeout(async () => {
        const coords = await geocodeAddress(address);
        if (coords) {
          setDeliveryCoords(coords);
          
          // Update map marker
          if (mapInstanceRef.current && (window as any).L) {
            const L = (window as any).L;
            if ((window as any).deliveryMarker) {
              (window as any).deliveryMarker.setLatLng([coords.lat, coords.lng]);
            } else {
              (window as any).deliveryMarker = L.marker([coords.lat, coords.lng], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }).addTo(mapInstanceRef.current).bindPopup('Delivery Location');
            }
          }
        }
        setIsGeocodingDelivery(false);
      }, 1000); // 1 second debounce
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickup_address || !formData.delivery_address) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if coordinates are available
    if (!pickupCoords || !deliveryCoords) {
      setError('Please wait for addresses to be geocoded or select locations on the map');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add coordinates to the order data
      const orderData = {
        ...formData,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        delivery_lat: deliveryCoords.lat,
        delivery_lng: deliveryCoords.lng,
      };
      
      console.log('Creating order with data:', orderData);
      const response = await orderApi.createOrder(orderData);
      console.log('Order created successfully:', response);
      
      // Pass the created order data back to parent
      onSuccess({
        ...formData,
        orderId: response.order?.order_id || Date.now(),
        createdOrder: response.order
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to create order';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure backend is running at http://localhost:5000';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please logout and login again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create New Order</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left side - Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Pickup Address *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={formData.pickup_address}
                    onChange={(e) => handlePickupAddressChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectingLocation === 'pickup' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectingLocation === 'pickup' ? 'Click Map' : 'Map'}
                </button>
              </div>
              {pickupCoords && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Navigation className="w-4 h-4 inline mr-1" />
                Delivery Address *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={formData.delivery_address}
                    onChange={(e) => handleDeliveryAddressChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectingLocation === 'delivery' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectingLocation === 'delivery' ? 'Click Map' : 'Map'}
                </button>
              </div>
              {deliveryCoords && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {deliveryCoords.lat.toFixed(6)}, {deliveryCoords.lng.toFixed(6)}
                </p>
              )}
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.distance_km || ''}
              onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auto-calculated"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              ✅ Auto-calculated from addresses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Estimate (VND)
            </label>
            <input
              type="number"
              value={formData.price_estimate || ''}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auto-calculated"
            />
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <p>📊 Base: 10,000 VND + {(formData.distance_km || 0).toFixed(1)}km × 5,000 VND</p>
              <p className="font-semibold text-blue-600">
                Total: {(formData.price_estimate || 0).toLocaleString()} VND
              </p>
            </div>
          </div>

          {/* Weather Info Box */}
          {weather && (
            <div className={`p-4 rounded-lg border-2 ${
              weather === 'clear' ? 'bg-blue-50 border-blue-200' :
              weather === 'rain' ? 'bg-orange-50 border-orange-200' :
              weather === 'thunderstorm' ? 'bg-red-50 border-red-200' :
              weather === 'snow' ? 'bg-purple-50 border-purple-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  {weather === 'clear' ? '☀️ Weather: Clear' :
                   weather === 'rain' ? '🌧️ Weather: Rainy' :
                   weather === 'thunderstorm' ? '⛈️ Weather: Thunderstorm' :
                   weather === 'snow' ? '❄️ Weather: Snowy' :
                   '🌤️ Weather: ' + weather}
                </h4>
              </div>
              
              {weather !== 'clear' && (
                <div className="space-y-1">
                  <p className="text-sm text-orange-700 font-medium">
                    Weather Surcharge Applied: +{
                      weather === 'rain' ? '5,000' : 
                      weather === 'thunderstorm' ? '10,000' : 
                      weather === 'snow' ? '8,000' : '0'
                    } VND
                  </p>
                  <p className="text-xs text-gray-600">
                    {weather === 'rain' ? '⚠️ Rainy conditions may slow delivery' :
                     weather === 'thunderstorm' ? '⚠️ Severe weather - delivery may be delayed' :
                     weather === 'snow' ? '⚠️ Snow conditions - extra care needed' :
                     ''}
                  </p>
                </div>
              )}
              
              {weather === 'clear' && (
                <p className="text-xs text-gray-600">
                  ✅ Good weather - No additional charges
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Payment Method *
            </label>
            <select
              value={formData.payment_method || 'cash'}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>

          {/* Right side - Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                <Map className="w-4 h-4 inline mr-1" />
                Select Location on Map
              </label>
              {selectingLocation && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  Click map to set {selectingLocation === 'pickup' ? '🟢 Pickup' : '🔴 Delivery'}
                </span>
              )}
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-[500px] rounded-lg border-2 border-gray-300"
              style={{ minHeight: '500px' }}
            />
            <p className="text-xs text-gray-500">
              💡 Click "Select on Map" button, then click on the map to set pickup (green) or delivery (red) location
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
