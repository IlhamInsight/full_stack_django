import { useState, useEffect } from 'react';
import { Users, Home, CalendarCheck, CreditCard, TrendingUp, BarChart3, Settings, CheckCircle, XCircle, RefreshCw, Eye, CalendarOff, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    rooms: 0,
    users: 0
  });
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    location: '',
    capacity: '',
    price_per_hour: '',
    description: '',
    status: 'active'
  });
  const [isAddingBlackout, setIsAddingBlackout] = useState(false);
  const [newBlackout, setNewBlackout] = useState({ room: '', date: '', reason: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be separate admin endpoints
      const [bookingsRes, paymentsRes, roomsRes, blackoutRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/payments/'),
        api.get('/rooms/'),
        api.get('/blackout-dates/')
      ]);
      
      setBookings(bookingsRes.data.results || bookingsRes.data);
      setPayments(paymentsRes.data.results || paymentsRes.data);
      setRooms(roomsRes.data.results || roomsRes.data);
      setBlackoutDates(blackoutRes.data.results || blackoutRes.data);
      
      const statsRes = await api.get('/bookings/admin_stats/');
      const adminStats = statsRes.data;
      
      setStats({
        revenue: adminStats.total_revenue,
        bookings: adminStats.total_bookings,
        rooms: adminStats.total_rooms,
        users: adminStats.total_users
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      toast.error('Gagal memuat data admin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRefund = async (paymentId) => {
    if (!window.confirm('Setujui pengembalian dana ini?')) return;
    try {
      await api.post(`/payments/${paymentId}/approve_refund/`);
      toast.success('Refund berhasil disetujui');
      fetchData();
    } catch (error) {
      toast.error('Gagal menyetujui refund');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/approve/`);
      toast.success('Booking disetujui');
      fetchData();
    } catch (error) {
      toast.error('Gagal menyetujui booking');
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      await api.post(`/payments/${paymentId}/verify/`);
      toast.success('Pembayaran terverifikasi & Booking disetujui');
      fetchData();
    } catch (error) {
      toast.error('Gagal verifikasi pembayaran');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      await api.post(`/payments/${paymentId}/reject/`);
      toast.success('Pembayaran ditolak');
      fetchData();
    } catch (error) {
      toast.error('Gagal menolak pembayaran');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/complete/`);
      toast.success('Booking diselesaikan');
      fetchData();
    } catch (error) {
      toast.error('Gagal menyelesaikan booking');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms/', newRoom);
      toast.success('Ruangan berhasil ditambahkan');
      setIsAddingRoom(false);
      setNewRoom({
        name: '',
        location: '',
        capacity: '',
        price_per_hour: '',
        description: '',
        status: 'active'
      });
      fetchData();
    } catch (error) {
      toast.error('Gagal menambahkan ruangan');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'refunding': return 'bg-blue-100 text-blue-700';
      case 'refunded': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const adminStats = [
    { title: 'Total Revenue', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, change: '+12%', icon: <TrendingUp className="text-green-500"/>, bg: 'bg-green-50' },
    { title: 'Total Bookings', value: stats.bookings, change: '+5%', icon: <CalendarCheck className="text-blue-500"/>, bg: 'bg-blue-50' },
    { title: 'Active Rooms', value: stats.rooms, change: '0%', icon: <Home className="text-purple-500"/>, bg: 'bg-purple-50' },
    { title: 'Total Users', value: stats.users, change: '+18%', icon: <Users className="text-amber-500"/>, bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-80px)]">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0">
        <div className="p-6 sticky top-20">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Admin Dashboard</h2>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BarChart3 size={20}/> Overview
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CalendarCheck size={20}/> Bookings
            </button>
            <button 
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'rooms' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Home size={20}/> Rooms
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CreditCard size={20}/> Payments
            </button>
            <button 
              onClick={() => setActiveTab('blackout')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'blackout' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CalendarOff size={20}/> Tanggal Libur
            </button>
          </nav>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 capitalize">{activeTab}</h1>
            <p className="text-slate-500">Welcome back, Admin. Manage your business here.</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="overview">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminStats.map((stat, idx) => (
                  <div key={stat.title} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg}`}>
                        {stat.icon}
                      </div>
                      <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-slate-400'}`}>{stat.change}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900">{stat.value}</h3>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="p-4 font-medium first:pl-6">Booking ID</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Room</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium last:pr-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-slate-500 first:pl-6">{b.booking_code}</td>
                          <td className="p-4 font-medium text-slate-900">{b.user_name}</td>
                          <td className="p-4">{b.room_name}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 font-medium last:pr-6 text-right">Rp {parseFloat(b.total_price).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="bookings">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="p-4 font-medium first:pl-6">Code</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Room</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium last:pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-slate-500 first:pl-6">{b.booking_code}</td>
                          <td className="p-4 font-medium text-slate-900">{b.user_name}</td>
                          <td className="p-4">{b.room_name}</td>
                          <td className="p-4 text-slate-500">{new Date(b.booking_date).toLocaleDateString('id-ID')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(b.status)}`}>
                              {b.status_display || b.status}
                            </span>
                          </td>
                          <td className="p-4 last:pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              {b.status === 'pending' && (
                                <button 
                                  onClick={() => handleApproveBooking(b.id)}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" 
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {b.status === 'approved' && (
                                <button 
                                  onClick={() => handleCompleteBooking(b.id)}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" 
                                  title="Complete"
                                >
                                  <CheckCircle size={18} className="text-blue-500" />
                                </button>
                              )}
                              <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100" title="View Details">
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rooms' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="rooms">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Semua Ruangan</h3>
                <button 
                  onClick={() => setIsAddingRoom(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Home size={18} /> Tambah Ruangan
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="p-4 font-medium first:pl-6">Nama Ruangan</th>
                        <th className="p-4 font-medium">Lokasi</th>
                        <th className="p-4 font-medium">Kapasitas</th>
                        <th className="p-4 font-medium">Harga/Jam</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium last:pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                      {rooms.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-900 first:pl-6">{r.name}</td>
                          <td className="p-4 text-slate-500">{r.location}</td>
                          <td className="p-4">{r.capacity} Orang</td>
                          <td className="p-4">Rp {parseFloat(r.price_per_hour).toLocaleString('id-ID')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 last:pr-6 text-right">
                            <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100">
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="payments">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="p-4 font-medium first:pl-6">Booking</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Method</th>
                        <th className="p-4 font-medium last:pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-slate-500 first:pl-6">{p.booking_code}</td>
                          <td className="p-4 font-medium text-slate-900">{p.user_name}</td>
                          <td className="p-4">Rp {parseFloat(p.amount).toLocaleString('id-ID')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(p.status)}`}>
                              {p.status_display || p.status}
                            </span>
                          </td>
                          <td className="p-4 capitalize">{p.payment_method}</td>
                          <td className="p-4 last:pr-6 text-right">
                            {p.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleVerifyPayment(p.id)}
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Verify Payment"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  onClick={() => handleRejectPayment(p.id)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject Payment"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            ) : p.status === 'refunding' ? (
                              <button 
                                onClick={() => handleApproveRefund(p.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 ml-auto"
                              >
                                <RefreshCw size={14} /> Setujui Refund
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">No Actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blackout' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="blackout">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Tanggal Libur / Blackout</h3>
                <button 
                  onClick={() => setIsAddingBlackout(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> Tambah Tanggal
                </button>
              </div>

              {/* Add Blackout Form */}
              {isAddingBlackout && (
                <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6">
                  <h4 className="font-bold text-slate-900 mb-4">Tambah Tanggal Libur</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await api.post('/blackout-dates/', newBlackout);
                      toast.success('Tanggal libur berhasil ditambahkan');
                      setIsAddingBlackout(false);
                      setNewBlackout({ room: '', date: '', reason: '' });
                      fetchData();
                    } catch (error) {
                      toast.error('Gagal menambahkan tanggal libur');
                    }
                  }} className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Ruangan</label>
                      <select
                        required
                        value={newBlackout.room}
                        onChange={(e) => setNewBlackout({...newBlackout, room: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Pilih ruangan</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date" required
                        value={newBlackout.date}
                        onChange={(e) => setNewBlackout({...newBlackout, date: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Alasan</label>
                      <input
                        type="text"
                        value={newBlackout.reason}
                        onChange={(e) => setNewBlackout({...newBlackout, reason: e.target.value})}
                        placeholder="Contoh: Hari Libur Nasional"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3 flex gap-3 justify-end">
                      <button type="button" onClick={() => setIsAddingBlackout(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Simpan</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="p-4 font-medium first:pl-6">Ruangan</th>
                        <th className="p-4 font-medium">Tanggal</th>
                        <th className="p-4 font-medium">Alasan</th>
                        <th className="p-4 font-medium last:pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                      {blackoutDates.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-400">Belum ada tanggal libur</td></tr>
                      ) : blackoutDates.map((bd) => {
                        const roomObj = rooms.find(r => r.id === bd.room);
                        return (
                          <tr key={bd.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-900 first:pl-6">{roomObj?.name || `Room #${bd.room}`}</td>
                            <td className="p-4">{new Date(bd.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td className="p-4 text-slate-500">{bd.reason || '-'}</td>
                            <td className="p-4 last:pr-6 text-right">
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Hapus tanggal libur ini?')) return;
                                  try {
                                    await api.delete(`/blackout-dates/${bd.id}/`);
                                    toast.success('Tanggal libur dihapus');
                                    fetchData();
                                  } catch { toast.error('Gagal menghapus'); }
                                }}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100" title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Add Room Modal */}
      <AnimatePresence>
        {isAddingRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-bold text-slate-900">Tambah Ruangan Baru</h3>
                <button onClick={() => setIsAddingRoom(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Ruangan</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Contoh: Meeting Room A"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Lantai 1"
                      value={newRoom.location}
                      onChange={(e) => setNewRoom({...newRoom, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="10"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Harga / Jam</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="150000"
                      value={newRoom.price_per_hour}
                      onChange={(e) => setNewRoom({...newRoom, price_per_hour: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newRoom.status}
                      onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}
                    >
                      <option value="active">Aktif</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Non-aktif</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      rows="3"
                      placeholder="Jelaskan fasilitas ruangan..."
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAddingRoom(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Simpan Ruangan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
