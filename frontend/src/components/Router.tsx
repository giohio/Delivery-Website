import { MemberProvider } from '../../intergration';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '../../intergration/errorHandlers/ErrorPage';
// import HomePage from '@/components/pages/HomePage';
import CustomerDashboard from '@/components/pages/CustomerDashboard';
import CourierDashboard from '@/components/pages/CourierDashboard';
import MerchantDashboard from '@/components/pages/MerchantDashboard';
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
        element: (
          <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f3f4f6' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>FastDelivery</h1>
            <p style={{ marginBottom: '1rem' }}>Welcome to FastDelivery!</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/customer" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
                Customer Dashboard
              </a>
              <a href="/admin" style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
                Admin Dashboard
              </a>
            </div>
          </div>
        ),
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
