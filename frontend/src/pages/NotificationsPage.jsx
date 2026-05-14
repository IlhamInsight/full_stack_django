import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchUnreadCount } = useAuthStore();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      toast.success('All notifications marked as read');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_as_read/`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'booking_approved':
      case 'payment_verified':
        return <CheckCircle className="text-green-500 w-6 h-6" />;
      case 'booking_pending':
      case 'payment_reminder':
        return <Clock className="text-amber-500 w-6 h-6" />;
      case 'booking_rejected':
      case 'booking_cancelled':
      case 'payment_rejected':
        return <AlertCircle className="text-red-500 w-6 h-6" />;
      default:
        return <Bell className="text-blue-500 w-6 h-6" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minutes ago`;
    return 'Just now';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
          <p className="text-slate-500">Stay updated with your bookings and account activity</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="text-blue-600 font-medium hover:underline flex items-center gap-2"
          >
            <CheckCircle size={18} /> Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
            <p className="text-slate-500">When you book a room or have updates, they will appear here.</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`p-6 rounded-2xl border transition-all flex gap-4 cursor-pointer ${notif.is_read ? 'bg-white border-slate-100 shadow-sm' : 'bg-blue-50/50 border-blue-100 shadow-md ring-1 ring-blue-100'}`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{getTimeAgo(notif.created_at)}</span>
                </div>
                <p className={`text-sm ${notif.is_read ? 'text-slate-500' : 'text-slate-700'}`}>{notif.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
