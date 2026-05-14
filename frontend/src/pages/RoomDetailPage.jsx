import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Wifi, Coffee, Monitor, CheckCircle, CalendarDays, Star, ChevronLeft, Loader2, Wind, Edit, Send, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Helper for dynamic icons
const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('wifi')) return <Wifi size={20}/>;
  if (n.includes('coffee')) return <Coffee size={20}/>;
  if (n.includes('projector')) return <Monitor size={20}/>;
  if (n.includes('air')) return <Wind size={20}/>;
  if (n.includes('whiteboard')) return <Edit size={20}/>;
  return <CheckCircle size={20}/>;
};

export default function RoomDetailPage() {
  const { id } = useParams();
  const { rooms, fetchRooms, isLoading, getRoomById } = useRoomStore();
  const { user, isAuthenticated } = useAuthStore();

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, [fetchRooms, rooms.length]);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/?room=${id}`);
        const reviewData = response.data.results || response.data;
        setReviews(reviewData);
        
        // Check if current user already reviewed
        if (user) {
          const hasReview = reviewData.some(r => r.user === user.id);
          setUserHasReviewed(hasReview);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews/', {
        room: parseInt(id),
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review berhasil dikirim!');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      setUserHasReviewed(true);
      
      // Refresh reviews
      const response = await api.get(`/reviews/?room=${id}`);
      setReviews(response.data.results || response.data);
      
      // Refresh rooms to update rating
      fetchRooms();
    } catch (error) {
      const msg = error.response?.data?.non_field_errors?.[0] || 
                  error.response?.data?.detail || 
                  'Gagal mengirim review. Anda mungkin sudah pernah review ruangan ini.';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const room = getRoomById(id);

  // Calculate dynamic average rating from reviews
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Room not found</h2>
        <Link to="/rooms" className="text-blue-600 hover:underline">Back to rooms</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Image Gallery */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900 group">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link to="/rooms" className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft size={24} />
          </Link>
        </div>

        {/* Floating title bottom */}
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Premium</span>
              {reviews.length > 0 && (
                <span className="flex items-center gap-1 text-white"><Star className="text-yellow-400 fill-yellow-400" size={16}/> {avgRating} ({reviews.length} reviews)</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{room.name}</h1>
            <p className="text-slate-200 flex items-center gap-2 text-lg"><MapPin size={20}/> {room.location}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About this space</h2>
            <p className="text-slate-600 leading-relaxed">{room.description}</p>
          </section>

          {/* Amenities */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {room.amenityNames && room.amenityNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    {getAmenityIcon(name)}
                  </div>
                  <span className="font-medium">{name}</span>
                </div>
              ))}
              {(!room.amenityNames || room.amenityNames.length === 0) && (
                <p className="text-slate-500">No specific amenities listed.</p>
              )}
            </div>
          </section>

          {/* Reviews (Dynamic from API) */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Reviews {reviews.length > 0 && <span className="text-lg font-normal text-slate-400">({reviews.length})</span>}
              </h2>
              {isAuthenticated && !userHasReviewed && (
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} /> Tulis Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmitReview}
                className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100"
              >
                <h3 className="font-bold text-slate-900 mb-4">Bagikan pengalaman Anda</h3>
                
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star 
                          size={28} 
                          className={star <= reviewData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Komentar</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    rows="3"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Ceritakan pengalaman Anda menggunakan ruangan ini..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    Kirim Review
                  </button>
                </div>
              </motion.form>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Belum ada review</p>
                <p className="text-slate-400 text-sm mt-1">Jadilah yang pertama memberikan review!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                        {(review.user_name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{review.user_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="text-yellow-400">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                          <span>{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 mb-3">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-xl border border-slate-100/50">
            <div className="mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-extrabold text-slate-900">Rp {room.price.toLocaleString()}</span>
                <span className="text-slate-500 mb-1">/ hour</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16}/> Up to {room.capacity} people
              </div>
            </div>

            {/* Quick check availability mockup */}
            <div className="space-y-4 mb-6">
              <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</div>
                  <div className="text-slate-900 font-medium">Select a date</div>
                </div>
                <CalendarDays className="text-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-2xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Time</div>
                  <div className="text-slate-900 font-medium">--:--</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-2xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Time</div>
                  <div className="text-slate-900 font-medium">--:--</div>
                </div>
              </div>
            </div>

            <Link 
              to={`/book/${room.id}`} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex justify-center items-center"
            >
              Book Now
            </Link>
            
            <p className="text-center text-xs text-slate-500 mt-4">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
