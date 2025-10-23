import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Menu, X, User, LogOut, Settings, ChevronDown, LayoutDashboard, Shield, Truck, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  isScrolled: boolean;
}

const navItems = [
  { href: '#benefits', label: 'Lợi ích' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#pricing', label: 'Bảng giá' },
  { href: '#tracking', label: 'Tra cứu' },
  { href: '#drivers', label: 'Tài xế' },
  { href: '#merchants', label: 'Người bán' }
];

export function Header({ isScrolled }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };
  
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              FastDelivery
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  isScrolled ? 'text-gray-700' : 'text-gray-600'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                    className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
                      isScrolled ? 'text-gray-700' : 'text-gray-600'
                    }`}
                  >
                    <span>Dashboard</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showDashboardMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <button
                        onClick={() => {
                          navigate('/customer');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Customer Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/courier');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Courier Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/merchant');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Merchant Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      isScrolled ? 'text-gray-700' : 'text-gray-600'
                    }`}>
                      {user?.fullName || user?.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/customer');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Cài đặt
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`hover:text-blue-600 transition-colors ${
                    isScrolled ? 'text-gray-700' : 'text-gray-600'
                  }`}
                  aria-label="Đăng nhập"
                >
                  Đăng nhập
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  aria-label="Đăng ký"
                >
                  Đăng ký
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <nav className="flex flex-col space-y-4">
                <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Lợi ích
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Cách hoạt động
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Bảng giá
                </a>
                <a href="#tracking" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Tra cứu
                </a>
                <a href="#drivers" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Tài xế
                </a>
                <a href="#merchants" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Người bán
                </a>
              </nav>
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 rounded">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/customer');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Customer Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/courier');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Courier Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/merchant');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Merchant Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-red-600 hover:text-red-700 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                      aria-label="Đăng nhập"
                    >
                      Đăng nhập
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 text-center"
                      aria-label="Đăng ký"
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
