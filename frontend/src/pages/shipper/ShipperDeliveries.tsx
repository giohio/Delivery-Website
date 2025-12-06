import React, { useState, useEffect } from 'react';
import { Package, MapPin, Clock, User, Navigation, DollarSign, Phone, CheckCircle, XCircle, ArrowRight, Map as MapIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { deliveryApi, Delivery } from '../../services/deliveryApi';
import { orderApi, Order } from '../../services/orderApi';
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

interface DeliveryWithOrders extends Delivery {
  orders?: Order[];
  created_at?: string;
  courier_fee?: number;
}

const ShipperDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryWithOrders[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryWithOrders[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showMap, setShowMap] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    ongoing: 0,
    completed: 0,
    canceled: 0,
    totalEarnings: 0,
    totalDistance: 0,
    totalOrders: 0,
    avgOrdersPerDelivery: 0
  });

  const menuItems = [
    { path: '/shipper/dashboard', label: 'Dashboard', icon: <Package /> },
    { path: '/shipper/deliveries', label: 'My Deliveries', icon: <Package /> },
    { path: '/shipper/available-orders', label: 'Available Orders', icon: <Navigation /> },
    { path: '/shipper/earnings', label: 'Earnings', icon: <DollarSign /> },
    { path: '/shipper/profile', label: 'Profile', icon: <User /> },
  ];

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, deliveries]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      console.log('[ShipperDeliveries] Starting to load deliveries...');
      
      const response = await deliveryApi.getMyDeliveries();
      console.log('[ShipperDeliveries] Deliveries response:', response);
      const deliveriesData = response.deliveries || [];
      console.log('[ShipperDeliveries] Deliveries count:', deliveriesData.length);

      // Load ALL orders once instead of per delivery
      let allOrders: Order[] = [];
      try {
        console.log('[ShipperDeliveries] Loading orders...');
        const ordersResponse = await orderApi.getMyOrders();
        console.log('[ShipperDeliveries] Orders response:', ordersResponse);
        allOrders = ordersResponse.orders || [];
        console.log('[ShipperDeliveries] Orders count:', allOrders.length);
      } catch (err) {
        console.error('[ShipperDeliveries] Failed to load orders:', err);
        // Show error details
        if (err instanceof Error) {
          console.error('[ShipperDeliveries] Error message:', err.message);
          console.error('[ShipperDeliveries] Error stack:', err.stack);
        }
      }

      // Map orders to deliveries
      const deliveriesWithOrders = deliveriesData.map((delivery: Delivery) => {
        const deliveryOrders = allOrders.filter((order: Order) => order.delivery_id === delivery.delivery_id);
        console.log(`[ShipperDeliveries] Delivery ${delivery.delivery_id}: ${deliveryOrders.length} orders`);
        return { ...delivery, orders: deliveryOrders };
      });

      setDeliveries(deliveriesWithOrders);

      // Calculate stats
      const totalOrdersCount = deliveriesWithOrders.reduce((sum, d) => sum + (d.orders?.length || 0), 0);
      const statsData = {
        total: deliveriesWithOrders.length,
        assigned: deliveriesWithOrders.filter(d => d.status === 'ASSIGNED').length,
        ongoing: deliveriesWithOrders.filter(d => d.status === 'ONGOING').length,
        completed: deliveriesWithOrders.filter(d => d.status === 'COMPLETED').length,
        canceled: deliveriesWithOrders.filter(d => d.status === 'CANCELED').length,
        totalEarnings: deliveriesWithOrders
          .filter(d => d.status === 'COMPLETED')
          .reduce((sum, d) => sum + (Number(d.courier_fee) || 0), 0),
        totalDistance: deliveriesWithOrders.reduce((sum, d) => {
          const deliveryDistance = d.orders?.reduce((orderSum, o) => orderSum + (Number(o.distance_km) || 0), 0) || 0;
          return sum + deliveryDistance;
        }, 0),
        totalOrders: totalOrdersCount,
        avgOrdersPerDelivery: deliveriesWithOrders.length > 0 ? totalOrdersCount / deliveriesWithOrders.length : 0
      };
      setStats(statsData);
      console.log('[ShipperDeliveries] Stats:', statsData);
      console.log('[ShipperDeliveries] Loading complete!');
    } catch (err) {
      console.error('[ShipperDeliveries] Failed to load deliveries:', err);
      if (err instanceof Error) {
        console.error('[ShipperDeliveries] Error message:', err.message);
        console.error('[ShipperDeliveries] Error stack:', err.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredDeliveries(deliveries);
    } else {
      const filtered = deliveries.filter(d => {
        if (filter === 'in_transit') return d.status === 'ONGOING' || d.status === 'ASSIGNED';
        if (filter === 'delivered') return d.status === 'COMPLETED';
        if (filter === 'failed') return d.status === 'CANCELED';
        return d.status?.toUpperCase() === filter.toUpperCase();
      });
      setFilteredDeliveries(filtered);
    }
  };

  const handleStartDelivery = async (deliveryId: number) => {
    try {
      setUpdating(deliveryId);
      await deliveryApi.updateDeliveryStatus(deliveryId, { status: 'ONGOING' });
      await loadDeliveries();
      alert('Delivery started successfully!');
    } catch (err: any) {
      console.error('Failed to start delivery:', err);
      alert(err.message || 'Failed to start delivery');
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteDelivery = async (deliveryId: number) => {
    try {
      setUpdating(deliveryId);
      await deliveryApi.updateDeliveryStatus(deliveryId, { status: 'COMPLETED' });
      await loadDeliveries();
      alert('Delivery completed successfully!');
    } catch (err: any) {
      console.error('Failed to complete delivery:', err);
      alert(err.message || 'Failed to complete delivery');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelDelivery = async (deliveryId: number) => {
    if (!confirm('Are you sure you want to cancel this delivery?')) return;
    
    try {
      setUpdating(deliveryId);
      await deliveryApi.updateDeliveryStatus(deliveryId, { status: 'CANCELED' });
      await loadDeliveries();
      alert('Delivery cancelled!');
    } catch (err: any) {
      console.error('Failed to cancel delivery:', err);
      alert(err.message || 'Failed to cancel delivery');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
      picked_up: { color: 'bg-indigo-100 text-indigo-800', label: 'Picked Up' },
      in_transit: { color: 'bg-purple-100 text-purple-800', label: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems} role="shipper">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} role="shipper">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-600 mt-1">Track and manage all your delivery assignments.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Deliveries */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Deliveries</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                <div className="flex items-center space-x-2 mt-3 text-sm">
                  <span className="bg-orange-400/30 px-2 py-0.5 rounded">✓ {stats.completed}</span>
                  <span className="bg-orange-400/30 px-2 py-0.5 rounded">⏳ {stats.ongoing}</span>
                  <span className="bg-orange-400/30 px-2 py-0.5 rounded">📦 {stats.assigned}</span>
                </div>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEarnings.toLocaleString('vi-VN')}₫</p>
                <p className="text-emerald-100 text-xs mt-3">From {stats.completed} completed deliveries</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Total Distance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Distance</p>
                <p className="text-3xl font-bold mt-2">{stats.totalDistance.toFixed(1)} km</p>
                <p className="text-blue-100 text-xs mt-3">Across all deliveries</p>
              </div>
              <Navigation className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-purple-100 text-xs mt-3">Avg {stats.avgOrdersPerDelivery.toFixed(1)} per delivery</p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'in_transit', 'delivered', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-6">
          {filteredDeliveries.length > 0 ? (
            filteredDeliveries.map((delivery) => (
              <div key={delivery.delivery_id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                        <Package className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Delivery #{delivery.delivery_id}</h3>
                        <p className="text-orange-100 mt-1">
                          {delivery.orders && delivery.orders.length > 0 
                            ? `${delivery.orders.length} order${delivery.orders.length > 1 ? 's' : ''} • ${Number(delivery.orders.reduce((sum, o) => sum + (Number(o.distance_km) || 0), 0)).toFixed(1)} km total`
                            : 'No orders assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(delivery.status)}
                      {delivery.courier_fee && (
                        <p className="text-2xl font-bold mt-2">{Number(delivery.courier_fee).toLocaleString('vi-VN')}₫</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                {delivery.orders && delivery.orders.length > 0 && (
                  <div className="p-6 space-y-4">
                    {delivery.orders.map((order, index) => (
                      <div key={order.order_id} className="relative">
                        {/* Order Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all">
                          {/* Order Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Order #{order.order_id}</p>
                                <p className="text-sm text-gray-500">
                                  {order.service_type && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                      {order.service_type}
                                    </span>
                                  )}
                                  {order.package_size && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      {order.package_size}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {order.distance_km && (
                                <p className="text-sm font-medium text-gray-600">{Number(order.distance_km).toFixed(1)} km</p>
                              )}
                              {order.price_estimate && (
                                <p className="text-lg font-bold text-orange-600">{Number(order.price_estimate).toLocaleString('vi-VN')}₫</p>
                              )}
                            </div>
                          </div>

                          {/* Addresses */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                                <MapPin className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pickup Location</p>
                                <p className="text-sm font-medium text-gray-900">{order.pickup_address}</p>
                                {order.pickup_contact_name && (
                                  <div className="mt-2 flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-1" />
                                    {order.pickup_contact_name}
                                    {order.pickup_contact_phone && (
                                      <span className="ml-2 flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        {order.pickup_contact_phone}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-center py-2">
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="flex items-start space-x-3">
                              <div className="bg-red-100 rounded-lg p-2 flex-shrink-0">
                                <MapPin className="w-5 h-5 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Delivery Location</p>
                                <p className="text-sm font-medium text-gray-900">{order.delivery_address}</p>
                                {order.delivery_contact_name && (
                                  <div className="mt-2 flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-1" />
                                    {order.delivery_contact_name}
                                    {order.delivery_contact_phone && (
                                      <span className="ml-2 flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        {order.delivery_contact_phone}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-amber-800 uppercase tracking-wide mb-1">Note</p>
                              <p className="text-sm text-amber-900">{order.notes}</p>
                            </div>
                          )}

                          {/* Navigation & Map Buttons */}
                          {order.pickup_lat && order.pickup_lng && order.delivery_lat && order.delivery_lng && (
                            <div className="mt-4 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => {
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.pickup_lat},${order.pickup_lng}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium"
                                >
                                  <Navigation className="w-4 h-4" />
                                  <span>To Pickup</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium"
                                >
                                  <Navigation className="w-4 h-4" />
                                  <span>To Delivery</span>
                                </button>
                              </div>
                              <button
                                onClick={() => setShowMap(showMap === order.order_id ? null : order.order_id)}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
                              >
                                <MapIcon className="w-4 h-4" />
                                <span>{showMap === order.order_id ? 'Hide Map' : 'View on Map'}</span>
                              </button>
                            </div>
                          )}

                          {/* Map */}
                          {showMap === order.order_id && order.pickup_lat && order.pickup_lng && order.delivery_lat && order.delivery_lng && (
                            <div className="mt-4 h-80 rounded-xl overflow-hidden border-2 border-gray-200">
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
                                      <p className="font-semibold text-green-600">Pickup</p>
                                      <p>{order.pickup_address}</p>
                                      {order.pickup_contact_name && <p className="text-gray-600">{order.pickup_contact_name}</p>}
                                    </div>
                                  </Popup>
                                </Marker>
                                <Marker position={[order.delivery_lat, order.delivery_lng]} icon={deliveryIcon}>
                                  <Popup>
                                    <div className="text-sm">
                                      <p className="font-semibold text-red-600">Delivery</p>
                                      <p>{order.delivery_address}</p>
                                      {order.delivery_contact_name && <p className="text-gray-600">{order.delivery_contact_name}</p>}
                                    </div>
                                  </Popup>
                                </Marker>
                                <Polyline
                                  positions={[
                                    [order.pickup_lat, order.pickup_lng],
                                    [order.delivery_lat, order.delivery_lng]
                                  ]}
                                  color="#f97316"
                                  weight={3}
                                  opacity={0.7}
                                />
                              </MapContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer - Delivery Info & Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Created: {delivery.created_at ? new Date(delivery.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
                      </div>
                      {delivery.updated_at && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-600" />
                          <span>Updated: {new Date(delivery.updated_at).toLocaleString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {delivery.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStartDelivery(delivery.delivery_id)}
                        disabled={updating === delivery.delivery_id}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                      >
                        {updating === delivery.delivery_id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-5 h-5 mr-2" />
                            Start Delivery
                          </>
                        )}
                      </button>
                    )}

                    {delivery.status === 'ONGOING' && (
                      <button
                        onClick={() => handleCompleteDelivery(delivery.delivery_id)}
                        disabled={updating === delivery.delivery_id}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                      >
                        {updating === delivery.delivery_id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Complete Delivery
                          </>
                        )}
                      </button>
                    )}

                    {(delivery.status === 'ASSIGNED' || delivery.status === 'ONGOING') && (
                      <button
                        onClick={() => handleCancelDelivery(delivery.delivery_id)}
                        disabled={updating === delivery.delivery_id}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                      >
                        {updating === delivery.delivery_id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2" />
                            Cancel
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No deliveries found</h3>
              <p className="text-gray-500">
                {filter !== 'all' ? 'Try changing the filter to see more deliveries' : 'Start accepting orders from the Available Orders page'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperDeliveries;
