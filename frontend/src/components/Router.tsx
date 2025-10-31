import { MemberProvider } from '../../intergration';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '../../intergration/errorHandlers/ErrorPage';
import HomePage from './HomePage';
import CustomerDashboard from '@/components/pages/CustomerDashboard';
import CourierDashboard from '@/components/pages/CourierDashboard';
import MerchantDashboard from '@/components/pages/MerchantDashboard';
import AdminDashboard from '@/components/pages/AdminDashboard';
import ShipperDashboard from '../pages/ShipperDashboardModern';

import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

// Layout component that includes ScrollToTop
function Layout() {
  console.log('Layout rendering');
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "customer",
        element: <CustomerDashboard />,
      },
      {
        path: "dashboard/customer",
        element: <CustomerDashboard />,
      },
      {
        path: "dashboard/courier",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển tài xế">
            <CourierDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "shipper",
        element: <ShipperDashboard />,
      },
      {
        path: "dashboard/shipper",
        element: <ShipperDashboard />,
      },
      {
        path: "dashboard/merchant",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển merchant">
            <MerchantDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "test-admin",
        element: <div style={{ padding: '50px', fontSize: '24px' }}>Admin route is working! Try /admin</div>,
      },
    ],
  },
]);

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
