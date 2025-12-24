import { useState, useEffect, useRef } from 'react';
import { Package, MapPin, Calculator, Truck, Plus, DollarSign, ShoppingBag, Search, User } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { merchantApi, CreateMerchantOrderRequest, Customer } from '../../services/merchantApi';

export default function MerchantCreateOrder() {
  const [formData, setFormData] = useState<CreateMerchantOrderRequest>({
    customer_id: 0,
    pickup_address: '',
    delivery_address: '',
    distance_km: 0,
    price_estimate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
  // Customer search states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { path: '/merchant/dashboard', icon: <Package className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders' },
    { path: '/merchant/available-orders', icon: <Package className="w-5 h-5" />, label: 'Available Orders' },
    { path: '/merchant/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
    { path: '/merchant/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
  ];

  // Handle customer search with debounce
  useEffect(() => {
    if (customerSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchLoading(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await merchantApi.searchCustomers(customerSearchQuery);
        setSearchResults(response.customers || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [customerSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.full_name);
    setFormData({ ...formData, customer_id: customer.user_id });
    setShowDropdown(false);
  };

  const calculateEstimate = () => {
    // Simple calculation: 10km = 50,000 VND base + 5,000 VND per km
    const distance = Math.random() * 10 + 2; // Random 2-12km for demo
    const price = 50000 + (distance * 5000);
    
    setCalculatedDistance(parseFloat(distance.toFixed(2)));
    setCalculatedPrice(Math.round(price));
    
    setFormData(prev => ({
      ...prev,
      distance_km: parseFloat(distance.toFixed(2)),
      price_estimate: Math.round(price),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !formData.customer_id) {
      alert('Please select a customer first');
      return;
    }

    if (!formData.pickup_address || !formData.delivery_address) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.price_estimate || !formData.distance_km) {
      alert('Please calculate the price estimate first');
      return;
    }

    try {
      setLoading(true);
      await merchantApi.createOrderForCustomer(formData);
      alert('Order created successfully!');
      
      // Reset form
      setFormData({
        customer_id: 0,
        pickup_address: '',
        delivery_address: '',
        distance_km: 0,
        price_estimate: 0,
      });
      setCalculatedDistance(null);
      setCalculatedPrice(null);
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setSearchResults([]);
      
      // Redirect to orders page
      window.location.href = '/merchant/orders';
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="merchant" menuItems={menuItems}>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-2">Place a delivery order for your customer</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
            
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    if (!e.target.value) {
                      setSelectedCustomer(null);
                      setFormData({ ...formData, customer_id: 0 });
                    }
                  }}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type customer name, email, or phone..."
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Selected customer display */}
              {selectedCustomer && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-blue-900">{selectedCustomer.full_name}</div>
                      <div className="text-sm text-blue-700">{selectedCustomer.email}</div>
                      {selectedCustomer.phone && (
                        <div className="text-sm text-blue-700">📞 {selectedCustomer.phone}</div>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      ID: {selectedCustomer.user_id}
                    </div>
                  </div>
                </div>
              )}

              {/* Search dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar-thin">
                  {searchResults.map((customer) => (
                    <div
                      key={customer.user_id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{customer.full_name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-xs text-gray-500">📞 {customer.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchResults.length === 0 && !searchLoading && customerSearchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  No customers found. Try a different search term.
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Type at least 2 characters to search by name, email, or phone number
              </p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Delivery Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-green-600 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter pickup address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-red-600 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Price Estimation
            </h3>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={calculateEstimate}
                disabled={!formData.pickup_address || !formData.delivery_address}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Calculate Price & Distance
              </button>

              {calculatedDistance && calculatedPrice && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-gray-600">Distance</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {calculatedDistance} km
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-gray-600">Estimated Price</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {calculatedPrice.toLocaleString()}₫
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Pricing Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Base price: 50,000₫</li>
                  <li>• Per kilometer: 5,000₫</li>
                  <li>• Prices may vary based on actual route</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between space-x-4">
            <button
              type="button"
              onClick={() => window.location.href = '/merchant/orders'}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !calculatedPrice}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Search for customers by typing their name, email, or phone number</li>
            <li>• Select a customer from the dropdown before proceeding</li>
            <li>• Provide complete and accurate addresses for better route calculation</li>
            <li>• Calculate the price before submitting the order</li>
            <li>• Contact support if you encounter any issues</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
