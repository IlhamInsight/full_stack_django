import { MapPin, Users, Wifi, Coffee, Monitor, CheckCircle, Wind, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoomCard({ room, viewMode = 'grid' }) {
  // Simple mock data fallback
  const r = room || {
    id: 1,
    name: 'Executive Boardroom',
    location: 'Sudirman, Jakarta',
    capacity: 12,
    price: 150000,
    rating: 0,
    reviews: 0,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    amenityNames: ['WiFi', 'Projector', 'Coffee / Tea']
  };

  const amenities = r.amenityNames || [];

  const getAmenityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('wifi')) return <Wifi size={14} />;
    if (n.includes('coffee')) return <Coffee size={14} />;
    if (n.includes('projector')) return <Monitor size={14} />;
    if (n.includes('air')) return <Wind size={14} />;
    if (n.includes('whiteboard')) return <Edit size={14} />;
    return <CheckCircle size={14} />;
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-48">
        <div className="sm:w-1/3 h-48 sm:h-full relative overflow-hidden shrink-0">
          <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {r.reviews > 0 && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
               ★ {r.rating} ({r.reviews})
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-900">{r.name}</h3>
              <span className="font-bold text-blue-600 text-lg">Rp {r.price.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/hr</span></span>
            </div>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1"><MapPin size={16}/> {r.location}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs flex items-center gap-1"><Users size={14}/> Up to {r.capacity}</span>
              {amenities.map(a => (
                <span key={a} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs flex items-center gap-1 capitalize">
                  {getAmenityIcon(a)} {a}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-auto">
             <Link to={`/rooms/${r.id}`} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">View Details</Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="h-48 relative overflow-hidden shrink-0">
        <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {r.reviews > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
              ★ {r.rating}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={r.name}>{r.name}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1 line-clamp-1"><MapPin size={14} className="shrink-0"/> {r.location}</p>
        
        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs flex items-center gap-1" title={`Up to ${r.capacity} people`}><Users size={12}/> {r.capacity}</span>
          {amenities.map(a => (
            <span key={a} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs flex items-center gap-1 capitalize" title={a}>
              {getAmenityIcon(a)}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <span className="font-bold text-blue-600">Rp {r.price.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/hr</span></span>
          <Link to={`/rooms/${r.id}`} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors">Book</Link>
        </div>
      </div>
    </div>
  );
}
