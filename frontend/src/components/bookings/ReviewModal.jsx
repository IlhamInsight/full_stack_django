import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/reviews/', {
        room: booking.room,
        booking: booking.id,
        rating,
        comment
      });
      toast.success('Review berhasil dikirim! Terima kasih 🎉');
      setRating(5);
      setComment('');
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error) {
      const msg = error.response?.data?.non_field_errors?.[0] ||
                  error.response?.data?.detail ||
                  Object.values(error.response?.data || {}).flat()[0] ||
                  'Gagal mengirim review.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tulis Review</h3>
                {booking && (
                  <p className="text-sm text-slate-500 mt-1">{booking.room_name}</p>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 mb-3">Bagaimana pengalaman Anda?</p>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hoveredStar || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium h-5">
                  {ratingLabels[hoveredStar || rating]}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Komentar (opsional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  placeholder="Ceritakan pengalaman Anda menggunakan ruangan ini..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                  Kirim
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
