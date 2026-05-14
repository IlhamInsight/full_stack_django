import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Upload, CheckCircle, Clock, Copy, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}/`);
        setBooking(response.data);
        
        // If already paid/approved, update status
        if (response.data.status === 'approved' || response.data.status === 'completed') {
          // You could redirect or show success
        }
      } catch (error) {
        console.error('Failed to fetch booking details', error);
        toast.error('Booking not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('booking', bookingId);
    formData.append('amount', booking.total_price);
    formData.append('method', 'transfer');
    formData.append('proof', file);

    try {
      await api.post('/payments/', formData);
      toast.success('Proof of payment uploaded successfully!');
      
      // Update booking status locally or refetch
      setBooking({ ...booking, status: 'pending' });
      
      // Redirect to bookings or show success message
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      console.error('Payment upload failed', error);
      toast.error('Failed to upload proof of payment');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking not found</h2>
        <Link to="/my-bookings" className="text-blue-600 hover:underline">Back to my bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Complete Payment</h1>
        <p className="text-slate-500 mt-2">Booking Code: <span className="font-mono font-bold text-slate-700">{booking.booking_code}</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Payment Instructions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
              <span className="text-slate-500">Total Amount to Pay</span>
              <span className="text-2xl font-bold text-slate-900">Rp {parseFloat(booking.total_price).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
              <Clock className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Complete payment within</p>
                <p className="text-xl font-bold text-amber-600">{formatTime(timeLeft)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 mb-2">Transfer to Virtual Account</h3>
              <div className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
                <div>
                  <p className="text-sm text-slate-500 mb-1">BCA Virtual Account</p>
                  <p className="font-mono text-lg font-bold text-slate-900">8077 0812 3456 7890</p>
                </div>
                <button onClick={() => handleCopy('8077081234567890')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Copy size={20} />
                </button>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Mandiri Virtual Account</p>
                  <p className="font-mono text-lg font-bold text-slate-900">89012 3456 7890 123</p>
                </div>
                <button onClick={() => handleCopy('8901234567890123')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Copy size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Upload Proof */}
        <div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-900 mb-2">Upload Proof of Payment</h3>
            <p className="text-sm text-slate-500 mb-6">After transferring, please upload your receipt here.</p>
            
            {isUploading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200">
                <Loader2 className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="font-bold text-slate-900 mb-1">Uploading Proof</h4>
                <p className="text-sm text-slate-500">Please wait while we send your receipt to our server...</p>
              </div>
            ) : (
              <label className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500 w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Click to upload or drag & drop</h4>
                <p className="text-sm text-slate-500">JPG, PNG, or PDF (Max. 5MB)</p>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
