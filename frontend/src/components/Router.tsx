import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import CustomerDashboard from '@/components/pages/CustomerDashboard';
import CourierDashboard from '@/components/pages/CourierDashboard';
import MerchantDashboard from '@/components/pages/MerchantDashboard';
import AdminDashboard from '@/components/pages/AdminDashboard';

import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

// Layout component that includes ScrollToTop
function Layout() {
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
        path: "dashboard/customer",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển khách hàng">
            <CustomerDashboard />
          </MemberProtectedRoute>
        ),
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
        path: "dashboard/merchant",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển merchant">
            <MerchantDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "dashboard/admin",
        element: (
          <MemberProtectedRoute messageToSignIn="Đăng nhập để truy cập bảng điều khiển quản trị">
            <AdminDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
