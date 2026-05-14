import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, ChevronRight, Loader2, XCircle, Star, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import BookingDetailModal from '../components/bookings/BookingDetailModal';
import ReviewModal from '../components/bookings/ReviewModal';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, cancelled, completed

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my_bookings/');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.post(`/bookings/${bookingId}/cancel/`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  // Detail Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  const handleOpenReview = (booking) => {
    setReviewBooking(booking);
    setShowReviewModal(true);
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'pending': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      case 'completed': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-500">Manage your upcoming and past room reservations</p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
          {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-6">You don't have any bookings in this category.</p>
            <Link to="/rooms" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">Book a Room</Link>
          </div>
        ) : (
          filteredBookings.map((booking, idx) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-mono text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded">{booking.booking_code}</span>
                  {getStatusBadge(booking.status)}
                  {booking.payment_status === 'refunding' && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider">Refund Diproses</span>
                  )}
                  {booking.payment_status === 'refunded' && (
                    <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider">Refund Selesai</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{booking.room_name}</h3>
                <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-slate-600 text-sm mb-4">
                  <p className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {new Date(booking.booking_date).toLocaleDateString('id-ID')}</p>
                  <p className="flex items-center gap-2"><Clock size={16} className="text-purple-500"/> {booking.start_time} - {booking.end_time}</p>
                  <p className="flex items-center gap-2 sm:col-span-2"><MapPin size={16} className="text-pink-500"/> {booking.room_location || 'Location Not Specified'}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                <div className="mb-4 text-left md:text-right w-full">
                  <p className="text-slate-500 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">Rp {parseFloat(booking.total_price).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                  {booking.status === 'pending' && !booking.has_payment ? (
                    <Link to={`/payment/${booking.id}`} className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                      Pay Now
                    </Link>
                  ) : booking.has_payment && booking.status === 'pending' ? (
                    <div className="flex-1 text-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
                      Menunggu Verifikasi
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleViewDetails(booking.id)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                  
                  {/* Invoice Button */}
                  {['approved', 'completed'].includes(booking.status) && booking.has_payment && (
                    <Link
                      to={`/invoice/${booking.id}`}
                      className="px-4 py-2.5 border border-blue-100 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <FileText size={16} /> Invoice
                    </Link>
                  )}

                  {/* Review Button */}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => handleOpenReview(booking)}
                      className="px-4 py-2.5 border border-yellow-200 text-yellow-600 rounded-xl text-sm font-medium hover:bg-yellow-50 transition-colors flex items-center gap-2"
                    >
                      <Star size={16} /> Review
                    </button>
                  )}
                  
                  {['pending', 'approved'].includes(booking.status) && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2.5 border border-red-100 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BookingDetailModal 
        booking={selectedBooking}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isLoading={isModalLoading}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        booking={reviewBooking}
        onReviewSubmitted={fetchBookings}
      />
    </div>
  );
}
