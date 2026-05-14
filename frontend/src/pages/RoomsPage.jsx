import { useState, useEffect } from 'react';
import RoomCard from '../components/rooms/RoomCard';
import { LayoutGrid, List, SlidersHorizontal, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRoomStore } from '../store/roomStore';

export default function RoomsPage() {
  const [viewMode, setViewMode] = useState('grid');
  
  const { fetchRooms, isLoading, error, filters, setFilters, getFilteredRooms } = useRoomStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = getFilteredRooms();

  const handleCapacityChange = (opt) => {
    if (opt === 'Any') {
      setFilters({ capacity: [] });
    } else {
      setFilters({ capacity: [opt] });
    }
  };

  const handleAmenityChange = (opt) => {
    const newAmenities = filters.amenities.includes(opt)
      ? filters.amenities.filter(a => a !== opt)
      : [...filters.amenities, opt];
    setFilters({ amenities: newAmenities });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Rooms</h1>
          <p className="text-slate-500">Find and book the perfect space for your needs</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={filters.searchTerm}
              onChange={(e) => setFilters({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid with Filter Sidebar space */}
      <div className="flex gap-8">
        {/* Hidden on mobile, can be a drawer later */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Max Price</h3>
              <span className="text-sm font-bold text-blue-600">Rp {(filters.priceRange / 1000).toLocaleString()}k</span>
            </div>
            <input 
              type="range" 
              min="0"
              max="1000000"
              step="50000"
              value={filters.priceRange}
              onChange={(e) => setFilters({ priceRange: Number(e.target.value) })}
              className="w-full mb-2 accent-blue-600" 
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Rp 0</span>
              <span>Rp 1M</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Capacity</h3>
            <div className="space-y-3">
              {['Any', '1-4 People', '5-10 People', '10-20 People', '20+ People'].map(opt => {
                const isChecked = opt === 'Any' ? filters.capacity.length === 0 : filters.capacity.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="capacity"
                      checked={isChecked}
                      onChange={() => handleCapacityChange(opt)}
                      className="rounded-full text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                    />
                    {opt === 'Any' ? 'Any Capacity' : opt}
                  </label>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Amenities</h3>
            <div className="space-y-3">
              {['WiFi', 'Projector', 'Whiteboard', 'Coffee / Tea', 'Air Conditioning'].map(opt => (
                <label key={opt} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.amenities.includes(opt)}
                    onChange={() => handleAmenityChange(opt)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 text-red-600">
               <h3 className="text-xl font-bold mb-2">Error loading rooms</h3>
               <p>{error}</p>
            </div>
          ) : filteredRooms.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
               <h3 className="text-xl font-bold text-slate-900 mb-2">No rooms found</h3>
               <p className="text-slate-500">Try adjusting your search or filters</p>
             </div>
          ) : (
            <motion.div 
              layout
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
            >
              {filteredRooms.map(room => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={room.id}
                >
                  <RoomCard room={room} viewMode={viewMode} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
