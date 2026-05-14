import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, MapPin, Loader2 } from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { rooms, fetchRooms, isLoading, setFilters } = useRoomStore();
  const navigate = useNavigate();

  const [searchLoc, setSearchLoc] = useState('');
  const [searchCap, setSearchCap] = useState('');

  useEffect(() => {
    // Only fetch if not already loaded to avoid redundant calls
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, [fetchRooms, rooms.length]);

  const handleSearch = () => {
    setFilters({
      searchTerm: searchLoc,
      capacity: searchCap ? [searchCap] : [],
    });
    navigate('/rooms');
  };

  // Get top 3 featured rooms (mock featured logic by just taking first 3)
  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background gradient/image pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 -z-10" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent -z-10 rounded-l-full blur-3xl transform translate-x-1/3" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">space</span> for your next meeting
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              Book premium meeting rooms, coworking spaces, and event venues instantly. Flexible, affordable, and fully equipped.
            </p>
          </motion.div>

          {/* Quick Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass p-4 rounded-3xl max-w-4xl shadow-xl flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="text-blue-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Location or building" 
                value={searchLoc}
                onChange={(e) => setSearchLoc(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400" 
              />
            </div>
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200">
              <Users className="text-pink-500 w-5 h-5" />
              <select 
                className="w-full bg-transparent outline-none text-slate-700"
                value={searchCap}
                onChange={(e) => setSearchCap(e.target.value)}
              >
                <option value="">Any Capacity</option>
                <option value="1-4 People">1-4 People</option>
                <option value="5-10 People">5-10 People</option>
                <option value="10-20 People">10-20 People</option>
                <option value="20+ People">20+ People</option>
              </select>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Rooms</h2>
              <p className="text-slate-500">Discover our most popular spaces</p>
            </div>
            <Link to="/rooms" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <div key={room.id} className="group rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="h-48 bg-slate-200 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{room.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        ★ {room.rating || 4.8}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1"><MapPin size={14}/> {room.location}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="font-bold text-blue-600">Rp {room.price.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/hr</span></span>
                      <Link to={`/rooms/${room.id}`} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">Book</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
