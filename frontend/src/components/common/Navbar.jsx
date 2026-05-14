import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Bell } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout, user, unreadNotifications, fetchUnreadCount } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      // Real-time update: poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        RoomBook
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/rooms" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Rooms</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
            <Link to="/notifications" className="text-slate-600 hover:text-blue-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-4">
              {user?.profile?.role === 'admin' && (
                <Link to="/admin" className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200">
                  Manage
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium group">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 transition-transform group-hover:scale-105">
                  {user?.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${user.profile.avatar}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold">
                      {(user?.full_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline">{user?.full_name || user?.username || 'Profile'}</span>
              </Link>
              <button onClick={logout} className="text-red-500 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
