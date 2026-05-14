import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />; // or to a 403 page
  }

  return <Outlet />;
}
