import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function InvoicePage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}/`);
        setBooking(response.data);
      } catch (error) {
        console.error('Failed to fetch booking details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!booking || !booking.invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Invoice tidak ditemukan</h2>
        <p className="text-slate-500 mb-4">Invoice belum dibuat untuk booking ini.</p>
        <Link to="/my-bookings" className="text-blue-600 hover:underline">Kembali ke My Bookings</Link>
      </div>
    );
  }

  const invoice = booking.invoice;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      {/* Global Style for Print Color Preservation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; }
          nav, footer, .no-print, button { display: none !important; }
          .min-h-screen { background-color: white !important; padding: 0 !important; }
          .max-w-3xl { max-width: 100% !important; margin: 0 !important; }
          .print-shadow { shadow: none !important; }
          .rounded-3xl { border-radius: 0 !important; }
          .shadow-xl { box-shadow: none !important; }
          .border { border-color: #eee !important; }
        }
      `}} />

      {/* Action Bar (hidden on print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link to="/my-bookings" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors no-print">
          <ArrowLeft size={20} /> Kembali
        </Link>
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 no-print"
        >
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-sm"></div>
                </div>
                <span className="text-xl font-black tracking-tighter">RoomBook</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">INVOICE</h1>
              <p className="text-blue-100 mt-1 font-mono text-sm">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <CheckCircle size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Lunas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Diterbitkan Untuk</h3>
              <p className="font-bold text-slate-900 text-lg">{booking.user_details?.full_name}</p>
              <p className="text-slate-500">{booking.user_details?.email}</p>
            </div>
            <div className="md:text-right">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detail Booking</h3>
              <p className="font-mono text-slate-700 font-bold">{booking.booking_code}</p>
              <p className="text-slate-500">Tanggal: {new Date(invoice.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="text-left p-4 font-medium">Deskripsi</th>
                  <th className="text-right p-4 font-medium">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{booking.room_details?.name || booking.room_name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500">Pukul {booking.start_time} - {booking.end_time}</p>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    Rp {parseFloat(invoice.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">Rp {parseFloat(invoice.amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>PPN (11%)</span>
                <span className="font-medium">Rp {parseFloat(invoice.tax).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-xl font-extrabold text-blue-600">Rp {parseFloat(invoice.total).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">Terima kasih telah menggunakan layanan kami.</p>
            <p className="text-xs text-slate-300 mt-2">Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
