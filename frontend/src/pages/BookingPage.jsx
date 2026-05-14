import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar, Clock, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoomById, rooms, fetchRooms } = useRoomStore();
  const { fetchUnreadCount } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    paymentMethod: 'transfer'
  });

  useEffect(() => {
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, [fetchRooms, rooms.length]);

  const room = getRoomById(id);

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.date || !formData.startTime || !formData.endTime) {
        toast.error('Please fill in all date and time fields');
        return;
      }
      if (calculateTotalPrice() === -1) {
        toast.error('Waktu selesai harus setelah waktu mulai');
        return;
      }
      // Check availability (includes blackout date check)
      setIsCheckingAvailability(true);
      try {
        const response = await api.get(`/rooms/${id}/check_availability/`, {
          params: { date: formData.date, start_time: formData.startTime, end_time: formData.endTime }
        });
        if (!response.data.available) {
          toast.error(response.data.reason || 'Ruangan tidak tersedia pada waktu ini');
          setIsCheckingAvailability(false);
          return;
        }
      } catch (error) {
        // If check fails, still allow (backend will validate on submit)
        console.warn('Availability check failed', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handlePrev = () => setStep(s => Math.max(s - 1, 1));
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const calculateTotalPrice = () => {
    const startTime = (formData.startTime || '').trim();
    const endTime = (formData.endTime || '').trim();
    
    if (!startTime || !endTime || !room) return 0;
    
    // String comparison is safest for HH:mm 24h format
    if (endTime <= startTime) return -1;
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startTotal = startH + (startM || 0) / 60;
    const endTotal = endH + (endM || 0) / 60;
    const diffHrs = endTotal - startTotal;
    
    const pricePerHour = room.price || parseFloat(room.price_per_hour) || 0;
    return Math.ceil(diffHrs * pricePerHour);
  };

  const handleBook = async () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice === -1) {
      toast.error('Waktu selesai harus setelah waktu mulai');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        room: id,
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        notes: formData.notes
      };

      const response = await api.post('/bookings/', payload);
      const booking = response.data;

      // Refresh notification count
      fetchUnreadCount();

      toast.success('Booking confirmed successfully!');
      
      // Redirect to payment page with the REAL booking ID from backend
      setTimeout(() => {
        navigate(`/payment/${booking.id}`);
      }, 1500);
    } catch (error) {
      console.error('Booking failed', error);
      const errorData = error.response?.data;
      let errorMsg = 'Booking failed. Please check availability.';
      
      if (typeof errorData === 'object' && errorData !== null) {
        // If it's a validation error (array of messages)
        const messages = Object.values(errorData).flat();
        if (messages.length > 0) errorMsg = messages[0];
      } else if (typeof errorData === 'string') {
        errorMsg = errorData;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        <p className="text-slate-500 mt-2">{room.name} - Rp {room.price.toLocaleString('id-ID')}/hr</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center w-full max-w-2xl">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <span className="text-sm mt-2 font-medium text-slate-700">Date & Time</span>
          </div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <span className="text-sm mt-2 font-medium text-slate-700">Details</span>
          </div>
          <div className={`h-1 flex-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
            <span className="text-sm mt-2 font-medium text-slate-700">Confirm</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] relative">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Calendar className="text-blue-500"/> Select Date & Time</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Booking Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                  <input 
                    type="time" 
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                  <input 
                    type="time" 
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">Additional Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Requests / Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4" 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="e.g., Please arrange the tables in a U-shape"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, paymentMethod: 'transfer'})}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-colors ${formData.paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  <CreditCard className={formData.paymentMethod === 'transfer' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <div 
                  onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-colors ${formData.paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  <CreditCard className={formData.paymentMethod === 'cash' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-medium">Cash on Location</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Check className="text-green-500"/> Review & Confirm</h2>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500">Room</span>
                <span className="font-bold text-slate-900">{room.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-medium text-slate-900">{formData.date || 'Not set'} • {formData.startTime || '--:--'} - {formData.endTime || '--:--'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-900 capitalize">{formData.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-900">Total Price</span>
                <span className="text-2xl font-extrabold text-blue-600">Rp {(totalPrice === -1 ? 0 : totalPrice).toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <label className="flex items-center gap-3 mt-4">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" required />
              <span className="text-sm text-slate-600">I agree to the Terms & Conditions and Cancellation Policy</span>
            </label>
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
          <button 
            onClick={step === 1 ? () => navigate(`/rooms/${id}`) : handlePrev}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={isCheckingAvailability}
              className="px-8 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isCheckingAvailability ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengecek...</> : <>Continue <ChevronRight size={18} /></>}
            </button>
          ) : (
            <button 
              onClick={handleBook}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
