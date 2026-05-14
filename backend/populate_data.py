"""
Script untuk populate sample data ke database
Jalankan: python manage.py shell < populate_data.py
"""

from django.contrib.auth.models import User
from core.models import (
    UserProfile, AmenityType, Room, RoomAvailability, 
    BlackoutDate, Booking, Payment, Notification, Review
)
from datetime import datetime, timedelta
import uuid

# Clear existing data
print("🗑️  Clearing existing data...")
Room.objects.all().delete()
AmenityType.objects.all().delete()

# Create Amenities
print("📌 Creating amenities...")
amenities_data = [
    {'name': 'WiFi', 'icon': '📡', 'description': 'Koneksi Internet cepat'},
    {'name': 'Air Conditioning', 'icon': '❄️', 'description': 'Pendingin ruangan'},
    {'name': 'Projector', 'icon': '🎬', 'description': 'Proyektor untuk presentasi'},
    {'name': 'Sound System', 'icon': '🔊', 'description': 'Sistem audio profesional'},
    {'name': 'Whiteboard', 'icon': '📋', 'description': 'Papan tulis interaktif'},
    {'name': 'Coffee Machine', 'icon': '☕', 'description': 'Mesin kopi'},
    {'name': 'Parking', 'icon': '🅿️', 'description': 'Tempat parkir tersedia'},
    {'name': 'Water Dispenser', 'icon': '💧', 'description': 'Dispenser air'},
]

amenities = {}
for amenity_data in amenities_data:
    amenity, created = AmenityType.objects.get_or_create(
        name=amenity_data['name'],
        defaults={
            'icon': amenity_data['icon'],
            'description': amenity_data['description']
        }
    )
    amenities[amenity_data['name']] = amenity
    print(f"  ✓ {amenity_data['name']}")

# Create Rooms
print("\n🏢 Creating rooms...")
rooms_data = [
    {
        'name': 'Meeting Room A',
        'location': 'Floor 1, Wing A',
        'capacity': 8,
        'description': 'Ruangan meeting modern dengan fasilitas lengkap',
        'price_per_hour': 150000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Whiteboard']
    },
    {
        'name': 'Meeting Room B',
        'location': 'Floor 1, Wing B',
        'capacity': 12,
        'description': 'Ruangan meeting besar untuk diskusi tim',
        'price_per_hour': 200000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Sound System', 'Whiteboard']
    },
    {
        'name': 'Conference Room',
        'location': 'Floor 2, Central',
        'capacity': 20,
        'description': 'Ruangan conference dengan teknologi terkini',
        'price_per_hour': 350000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Sound System', 'Whiteboard', 'Coffee Machine']
    },
    {
        'name': 'Training Room',
        'location': 'Floor 2, East Wing',
        'capacity': 30,
        'description': 'Ruangan training dengan kursi dan meja training',
        'price_per_hour': 400000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Whiteboard', 'Coffee Machine', 'Water Dispenser']
    },
    {
        'name': 'Boardroom',
        'location': 'Floor 3, Executive',
        'capacity': 15,
        'description': 'Ruangan eksklusif untuk rapat direktur',
        'price_per_hour': 500000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Sound System', 'Coffee Machine']
    },
    {
        'name': 'Studio Room',
        'location': 'Floor 1, Studio Wing',
        'capacity': 4,
        'description': 'Ruangan studio untuk recording dan fotografi',
        'price_per_hour': 100000,
        'amenities': ['WiFi', 'Air Conditioning', 'Sound System']
    },
    {
        'name': 'Open Space',
        'location': 'Floor 1, Lobby Area',
        'capacity': 50,
        'description': 'Area terbuka untuk workshop dan acara besar',
        'price_per_hour': 600000,
        'amenities': ['WiFi', 'Air Conditioning', 'Projector', 'Sound System', 'Coffee Machine', 'Water Dispenser']
    },
]

rooms = []
for room_data in rooms_data:
    amenity_list = room_data.pop('amenities')
    room, created = Room.objects.get_or_create(
        name=room_data['name'],
        location=room_data['location'],
        defaults={
            'capacity': room_data['capacity'],
            'description': room_data['description'],
            'price_per_hour': room_data['price_per_hour'],
            'is_available': True,
            'status': 'active'
        }
    )
    
    # Add amenities
    for amenity_name in amenity_list:
        room.amenities.add(amenities[amenity_name])
    
    rooms.append(room)
    print(f"  ✓ {room.name} (Capacity: {room.capacity})")

# Create Room Availability (Jam operasional)
print("\n⏰ Setting availability hours...")
for room in rooms:
    for day in range(7):  # 0=Senin, 6=Minggu
        # Tutup hari Minggu
        is_available = day != 6
        
        # Jam operasional
        opening_time = '08:00' if is_available else '00:00'
        closing_time = '17:00' if is_available else '00:00'
        
        RoomAvailability.objects.get_or_create(
            room=room,
            day_of_week=day,
            defaults={
                'opening_time': opening_time,
                'closing_time': closing_time,
                'is_available': is_available,
                'min_booking_hours': 1,
                'max_booking_hours': 8
            }
        )
    print(f"  ✓ {room.name}")

print("\n✅ Database populated successfully!")
print(f"  • {len(amenities)} Amenities created")
print(f"  • {len(rooms)} Rooms created")
print(f"  • {len(rooms) * 7} Availability rules created")
