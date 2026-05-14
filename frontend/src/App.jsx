import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));

// Fallback loader
const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const { fetchProfile, token, user } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="rooms/:id" element={<RoomDetailPage />} />
            
            {/* Protected Routes (User) */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="book/:id" element={<BookingPage />} />
              <Route path="my-bookings" element={<MyBookingsPage />} />
              <Route path="payment/:bookingId" element={<PaymentPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="invoice/:bookingId" element={<InvoicePage />} />
            </Route>
            
            {/* Protected Routes (Admin) */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<div className="text-center p-10 text-xl">404 - Page Not Found</div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
