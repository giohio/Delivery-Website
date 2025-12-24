import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Wallet,
  Gift,
  User,
  Search,
  Navigation,
  Clock,
  Phone,
  Star,
  CheckCircle,
  Truck,
  Home,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../../services/orderApi';
import { deliveryApi } from '../../services/deliveryApi';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const menuItems = [
  { path: '/customer/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { path: '/customer/orders', icon: <Package />, label: 'My Orders' },
  { path: '/customer/track-order', icon: <MapPin />, label: 'Track Order' },
  { path: '/customer/wallet', icon: <Wallet />, label: 'Wallet' },
  { path: '/customer/coupons', icon: <Gift />, label: 'Coupons' },
  { path: '/customer/profile', icon: <User />, label: 'Profile' },
];

export default function CustomerTrackOrder() {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  
  const [orderId, setOrderId] = useState(orderIdFromUrl || '');
  const [order, setOrder] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderIdFromUrl) {
      handleSearch();
    }
  }, [orderIdFromUrl]);

  const handleSearch = async () => {
    if (!orderId) {
      setError('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get order details
      const response = await orderApi.getMyOrders();
      const foundOrder = response.orders.find((o: any) => o.order_id.toString() === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
        
        // Get delivery info if order is assigned
        if (foundOrder.delivery_id) {
          try {
            const deliveriesResponse = await deliveryApi.getMyDeliveries();
            const foundDelivery = deliveriesResponse.deliveries?.find((d: any) => d.delivery_id === foundOrder.delivery_id);
            if (foundDelivery) {
              setDelivery(foundDelivery);
            }
          } catch (err) {
            console.error('Failed to fetch delivery:', err);
          }
        }
      } else {
        setError('Order not found');
        setOrder(null);
        setDelivery(null);
      }
    } catch (err) {
      setError('Failed to fetch order');
      setOrder(null);
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!order) return;
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const getStatusTimeline = (status: string) => {
    // Normalize status
    const normalizedStatus = status.toUpperCase();
    
    const statuses = [
      { key: 'PENDING', label: 'Order Placed', icon: Package },
      { key: 'ASSIGNED', label: 'Shipper Assigned', icon: User },
      { key: 'ONGOING', label: 'In Transit', icon: Truck },
      { key: 'COMPLETED', label: 'Delivered', icon: CheckCircle }
    ];
    
    // Map DELIVERED to COMPLETED
    const mappedStatus = normalizedStatus === 'DELIVERED' ? 'COMPLETED' : normalizedStatus;
    
    const statusIndex = statuses.findIndex(s => s.key === mappedStatus);
    
    return statuses.map((s, index) => ({
      ...s,
      active: index <= statusIndex,
      completed: index < statusIndex,
      current: index === statusIndex,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <DashboardLayout role="customer" menuItems={menuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
        <p className="text-gray-600 mt-1">Real-time tracking of your deliveries</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Order ID (e.g., 123)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {order ? (
        <>
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Order Timeline</h3>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-8 left-8 h-1 bg-gray-200" style={{ width: 'calc(100% - 4rem)' }}>
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
                  style={{ width: `${(getStatusTimeline(order.status).filter(s => s.completed).length / 3) * 100}%` }}
                />
              </div>
              
              {/* Timeline Steps */}
              <div className="relative flex items-start justify-between">
                {getStatusTimeline(order.status).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        item.completed
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110 ring-4 ring-green-200'
                          : item.current
                          ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white scale-125 animate-pulse ring-4 ring-orange-300'
                          : 'bg-white border-4 border-gray-300 text-gray-400'
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <Icon className="w-7 h-7" />
                        )}
                      </div>
                      <div className="text-center mt-4">
                        <p className={`text-sm font-bold ${
                          item.current ? 'text-orange-600 text-base' : item.active ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {item.label}
                        </p>
                        {item.current && (
                          <div className="mt-1 px-3 py-1 bg-orange-100 border border-orange-300 rounded-full">
                            <p className="text-xs text-orange-700 font-bold">● IN PROGRESS</p>
                          </div>
                        )}
                        {item.completed && (
                          <p className="text-xs text-green-600 font-medium mt-1">✓ Completed</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-600 rounded-full p-2">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className="text-lg font-bold text-gray-900">{order.status}</p>
                  </div>
                </div>
                {order.status === 'ONGOING' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated Arrival</p>
                    <p className="text-2xl font-bold text-teal-600">~25 min</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map & Route */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Live Tracking</h3>
                        <p className="text-teal-100 text-sm">Real-time location tracking</p>
                      </div>
                    </div>
                    {order.distance_km && (
                      <div className="text-right">
                        <p className="text-teal-100 text-sm">Distance</p>
                        <p className="text-2xl font-bold">{Number(order.distance_km).toFixed(1)} km</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {order.pickup_lat && order.pickup_lng && order.delivery_lat && order.delivery_lng ? (
                  <div className="h-96">
                    <MapContainer
                      center={[
                        (order.pickup_lat + order.delivery_lat) / 2,
                        (order.pickup_lng + order.delivery_lng) / 2
                      ]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[order.pickup_lat, order.pickup_lng]} icon={pickupIcon}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold text-green-600">Pickup Location</p>
                            <p>{order.pickup_address}</p>
                          </div>
                        </Popup>
                      </Marker>
                      <Marker position={[order.delivery_lat, order.delivery_lng]} icon={deliveryIcon}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold text-red-600">Delivery Location</p>
                            <p>{order.delivery_address}</p>
                          </div>
                        </Popup>
                      </Marker>
                      <Polyline
                        positions={[
                          [order.pickup_lat, order.pickup_lng],
                          [order.delivery_lat, order.delivery_lng]
                        ]}
                        pathOptions={{ color: '#14b8a6', weight: 4, opacity: 0.7 }}
                      />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Map Not Available</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Location data not available for this order
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Route Details</h3>
                <div className="space-y-4">
                  {/* Pickup */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-xl p-3 flex-shrink-0">
                      <Home className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pickup Location</p>
                      <p className="text-gray-900 font-medium">{order.pickup_address}</p>
                      {order.pickup_contact_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {order.pickup_contact_name}
                          </p>
                          {order.pickup_contact_phone && (
                            <p className="flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-1" />
                              {order.pickup_contact_phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center py-2">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Delivery */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 rounded-xl p-3 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivery Location</p>
                      <p className="text-gray-900 font-medium">{order.delivery_address}</p>
                      {order.delivery_contact_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {order.delivery_contact_name}
                          </p>
                          {order.delivery_contact_phone && (
                            <p className="flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-1" />
                              {order.delivery_contact_phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Delivery Notes</p>
                    <p className="text-sm text-amber-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="w-8 h-8" />
                  <div>
                    <p className="text-teal-100 text-sm">Order ID</p>
                    <p className="text-2xl font-bold">#{order.order_id}</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-teal-100">Service Type</p>
                    <p className="font-bold">{order.service_type || 'Standard'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-teal-100">Package Size</p>
                    <p className="font-bold">{order.package_size || 'Medium'}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/20 pt-3">
                    <p className="text-teal-100">Total Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(order.price_estimate || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Shipper Info */}
              {delivery && order.status !== 'PENDING' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Shipper</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {delivery.shipper_name ? delivery.shipper_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{delivery.shipper_name || 'Shipper'}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg">
                    <Phone className="w-5 h-5" />
                    <span>Contact Shipper</span>
                  </button>
                </div>
              )}

              {/* Timeline Info */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Order Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                  {delivery?.created_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Shipper Assigned</span>
                      <span className="font-medium text-gray-900">
                        {new Date(delivery.created_at).toLocaleString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {delivery?.updated_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium text-gray-900">
                        {new Date(delivery.updated_at).toLocaleString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ETA Card */}
              {order.status === 'ONGOING' && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-8 h-8" />
                    <div>
                      <p className="text-purple-100 text-sm">Estimated Time</p>
                      <p className="text-3xl font-bold">15-25 min</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-sm">🚚 Your order is on its way!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Order</h3>
          <p className="text-gray-600">Enter your order ID above to see real-time tracking</p>
        </div>
      )}
    </DashboardLayout>
  );
}
