import { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  ShieldCheck,
  DollarSign,
  Settings,
  BarChart3,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminMenuItems = [
  {
    path: '/admin/overview',
    icon: <LayoutDashboard />,
    label: 'Overview',
  },
  {
    path: '/admin/users',
    icon: <Users />,
    label: 'Users',
  },
  {
    path: '/admin/orders',
    icon: <Package />,
    label: 'Orders',
  },
  {
    path: '/admin/deliveries',
    icon: <Truck />,
    label: 'Deliveries',
  },
  {
    path: '/admin/kyc-approvals',
    icon: <ShieldCheck />,
    label: 'KYC Approvals',
    badge: 0, // Will be updated dynamically
  },
  {
    path: '/admin/financials',
    icon: <DollarSign />,
    label: 'Financials',
  },
  {
    path: '/admin/analytics',
    icon: <BarChart3 />,
    label: 'Analytics',
  },
  {
    path: '/admin/settings',
    icon: <Settings />,
    label: 'System Settings',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout role="admin" menuItems={adminMenuItems}>
      {children}
    </DashboardLayout>
  );
}
