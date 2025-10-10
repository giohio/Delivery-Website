import { useState } from 'react';
import { Package, Menu, X } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
            <div className="hidden md:flex items-center space-x-4">
              <button 
                type="button"
                className={`hover:text-blue-600 transition-colors ${
                  isScrolled ? 'text-gray-700' : 'text-gray-600'
                }`}
                aria-label="Đăng nhập"
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Đăng ký"
              >
                Đăng ký
              </button>
            </div>
            
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
                <button 
                  type="button"
                  className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                  aria-label="Đăng nhập"
                >
                  Đăng nhập
                </button>
                <button 
                  type="button"
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 text-center"
                  aria-label="Đăng ký"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
