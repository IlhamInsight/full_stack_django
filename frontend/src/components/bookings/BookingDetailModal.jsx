import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, CreditCard, FileText, Info, CalendarCheck, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingDetailModal({ booking, isOpen, onClose, isLoading }) {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {isLoading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading details...</p>
              </div>
            ) : booking && (
              <div className="flex flex-col">
                {/* Modal Header/Image */}
                <div className="h-48 sm:h-64 relative">
                  {booking.room_details?.image ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${booking.room_details.image}`} 
                      alt={booking.room_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <CalendarCheck size={48} className="text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {booking.booking_code}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{booking.room_name}</h2>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Clock size={12} className="text-blue-500" /> Waktu Booking
                        </p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="font-bold text-slate-800 text-lg mb-1">
                            {new Date(booking.booking_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-blue-600 font-bold">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MapPin size={12} className="text-pink-500" /> Lokasi
                        </p>
                        <p className="text-slate-700 font-medium">{booking.room_details?.location || booking.room_location || 'Lokasi tidak tersedia'}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CreditCard size={12} className="text-purple-500" /> Pembayaran
                        </p>
                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                          <p className="text-sm text-purple-700 font-medium mb-1">Total Biaya</p>
                          <p className="text-2xl font-extrabold text-slate-900">
                            Rp {parseFloat(booking.total_price).toLocaleString('id-ID')}
                          </p>
                          {booking.has_payment && (
                            <div className="mt-3 pt-3 border-t border-purple-100 flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Sudah Dibayar</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.notes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FileText size={12} className="text-amber-500" /> Catatan
                          </p>
                          <p className="text-slate-600 text-sm italic">"{booking.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Section */}
                  {booking.invoice && (
                    <div className="mb-8 p-5 bg-green-50/50 rounded-2xl border border-green-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <Receipt size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Invoice</p>
                            <p className="text-sm font-mono text-slate-600">{booking.invoice.invoice_number}</p>
                          </div>
                        </div>
                        <Link
                          to={`/invoice/${booking.id}`}
                          onClick={onClose}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          Lihat Invoice
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Modal Footer / Actions */}
                  <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                    {booking.status === 'pending' && !booking.has_payment ? (
                      <Link 
                        to={`/payment/${booking.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all"
                      >
                        Lanjut ke Pembayaran
                      </Link>
                    ) : (
                      <div className="flex-1 p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                          <Info size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Saat Ini</p>
                          <p className="text-sm font-bold text-slate-700">{booking.status_display || booking.status}</p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={onClose}
                      className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
