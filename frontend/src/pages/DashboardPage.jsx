import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { CalendarCheck, Clock, CreditCard, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BookingDetailModal from '../components/bookings/BookingDetailModal';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, unreadRes] = await Promise.all([
        api.get('/bookings/my_bookings/'),
        api.get('/notifications/unread_count/')
      ]);
      setBookings(bookingsRes.data);
      setUnreadCount(unreadRes.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleViewDetails = async (id) => {
    setIsModalLoading(true);
    setShowModal(true);
    try {
      const response = await api.get(`/bookings/${id}/`);
      setSelectedBooking(response.data);
    } catch (error) {
      toast.error("Gagal memuat detail pesanan");
      setShowModal(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  const pendingApprovals = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { title: 'Total Bookings', value: bookings.length, icon: <CalendarCheck className="text-blue-500"/>, bg: 'bg-blue-50' },
    { title: 'Pending Approvals', value: pendingApprovals, icon: <Clock className="text-amber-500"/>, bg: 'bg-amber-50' },
    { title: 'Total Spent', value: `Rp ${totalSpent.toLocaleString('id-ID')}`, icon: <CreditCard className="text-purple-500"/>, bg: 'bg-purple-50' },
    { title: 'Unread Notifications', value: unreadCount, icon: <Bell className="text-pink-500"/>, bg: 'bg-pink-50' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-slate-100 text-slate-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user ? user.full_name || user.username : 'User'}!
        </h1>
        <p className="text-slate-500">Here's an overview of your bookings and activities.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
            <Link to="/my-bookings" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">Loading bookings...</div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm">
                    <th className="p-4 font-medium first:pl-6">Room</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right last:pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                        <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p>You haven't made any bookings yet.</p>
                        <Link to="/rooms" className="text-blue-600 hover:underline mt-2 inline-block font-medium">Browse available rooms</Link>
                      </td>
                    </tr>
                  ) : (
                    bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-slate-900">{booking.room_name}</td>
                        <td className="p-4 text-slate-600">{new Date(booking.booking_date).toLocaleDateString('id-ID')}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.status === 'pending' && booking.has_payment && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase border border-blue-100">Paid</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => handleViewDetails(booking.id)}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center justify-end gap-1 ml-auto"
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Action Status Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Action Required</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
            {unreadCount > 0 ? (
              <>
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">You have {unreadCount} new notifications</h4>
                <p className="text-sm text-slate-500 mb-4">Please check your notifications for updates on your bookings.</p>
                <Link to="/notifications" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
                  View Notifications
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">You're all caught up!</h4>
                <p className="text-sm text-slate-500">No pending actions right now. Check your history to see past bookings.</p>
                <Link to="/my-bookings" className="text-blue-600 text-sm font-bold mt-4 hover:underline">Go to My Bookings</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal 
        booking={selectedBooking}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isLoading={isModalLoading}
      />
    </div>
  );
}
