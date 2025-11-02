import { MemberProvider } from '../../intergration';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '../../intergration/errorHandlers/ErrorPage';
import HomePage from './HomePage';
import Login from '../pages/Login';
import CustomerDashboard from '@/components/pages/CustomerDashboard';
import ShipperDashboard from '../pages/ShipperDashboardModern';
import MerchantDashboard from '../pages/MerchantDashboardNew';
import AdminDashboard from '@/components/pages/AdminDashboard';

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
        path: "login",
        element: <Login />,
      },

      {
        path: "customer",
        element: (
          <MemberProtectedRoute allowedRoles={['customer']} messageToSignIn="Đăng nhập để truy cập trang khách hàng">
            <CustomerDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "dashboard/customer",
        element: (
          <MemberProtectedRoute allowedRoles={['customer']} messageToSignIn="Đăng nhập để truy cập trang khách hàng">
            <CustomerDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "dashboard/courier",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển tài xế">
            <ShipperDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "courier",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển tài xế">
            <ShipperDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "shipper",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển shipper">
            <ShipperDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "dashboard/shipper",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển shipper">
            <ShipperDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "merchant",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển merchant">
            <MerchantDashboard />
          </MemberProtectedRoute>
        ),
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
