import { Link } from 'react-router-dom';
import { Truck, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerLinks = {
  services: [
    { name: 'Giao hàng tiêu chuẩn', href: '#' },
    { name: 'Giao hàng nhanh', href: '#' },
    { name: 'Giao hàng siêu tốc', href: '#' },
    { name: 'Thu hộ COD', href: '#' },
    { name: 'Giao hàng cuối tuần', href: '#' }
  ],
  company: [
    { name: 'Về chúng tôi', href: '#' },
    { name: 'Tin tức', href: '#' },
    { name: 'Tuyển dụng', href: '#' },
    { name: 'Liên hệ', href: '#' },
    { name: 'Đối tác', href: '#' }
  ],
  support: [
    { name: 'Trung tâm trợ giúp', href: '#' },
    { name: 'Hướng dẫn sử dụng', href: '#' },
    { name: 'Chính sách vận chuyển', href: '#' },
    { name: 'Điều khoản sử dụng', href: '#' },
    { name: 'Chính sách bảo mật', href: '#' }
  ]
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">FastShip</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Giải pháp giao hàng thông minh, nhanh chóng và đáng tin cậy cho mọi nhu cầu của bạn.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((service) => (
                <li key={service.name}>
                  <Link 
                    to={service.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Công ty</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Nhận tin tức</h4>
            <p className="text-gray-400 text-sm mb-4">
              Đăng ký để nhận thông tin khuyến mãi và tin tức mới nhất
            </p>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email của bạn"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center text-center">
            {footerLinks.support.map((item) => (
              <Link 
                key={item.name}
                to={item.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Hotline</p>
                <p className="text-gray-400 text-sm">1900-xxxx</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-gray-400 text-sm">support@fastship.vn</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Địa chỉ</p>
                <p className="text-gray-400 text-sm">Hà Nội, Việt Nam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 FastShip. All rights reserved. | 
            <Link to="#" className="hover:text-white ml-1">Privacy Policy</Link> | 
            <Link to="#" className="hover:text-white ml-1">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
