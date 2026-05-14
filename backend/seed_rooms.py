import os
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Room, AmenityType

def run_seed():
    # Clear existing to prevent duplicates
    Room.objects.all().delete()
    AmenityType.objects.all().delete()

    print("Seeding Amenities...")
    wifi = AmenityType.objects.create(name='WiFi', icon='wifi')
    projector = AmenityType.objects.create(name='Projector', icon='projector')
    coffee = AmenityType.objects.create(name='Coffee / Tea', icon='coffee')
    whiteboard = AmenityType.objects.create(name='Whiteboard', icon='edit')
    ac = AmenityType.objects.create(name='Air Conditioning', icon='wind')

    print("Seeding Rooms...")
    
    room1 = Room.objects.create(
        name='Executive Boardroom',
        location='Sudirman, Jakarta',
        capacity=12,
        price_per_hour=150000,
        description='Premium boardroom suitable for executive meetings with panoramic city views.',
        image='rooms/executive_boardroom.jpg' # we will just use a mock URL on frontend or let it be null and fallback
    )
    room1.amenities.set([wifi, projector, coffee, ac])

    room2 = Room.objects.create(
        name='Creative Studio',
        location='Kemang, Jakarta',
        capacity=6,
        price_per_hour=80000,
        description='A vibrant and inspiring space designed for creative brainstorming and collaboration.',
    )
    room2.amenities.set([wifi, coffee, whiteboard, ac])

    room3 = Room.objects.create(
        name='Grand Conference',
        location='Thamrin, Jakarta',
        capacity=50,
        price_per_hour=500000,
        description='Large conference room equipped with state-of-the-art audiovisual systems.',
    )
    room3.amenities.set([wifi, projector, coffee, ac, whiteboard])

    room4 = Room.objects.create(
        name='Focus Pod',
        location='SCBD, Jakarta',
        capacity=2,
        price_per_hour=40000,
        description='A quiet, soundproof pod perfect for 1-on-1 meetings or deep focus work.',
    )
    room4.amenities.set([wifi, ac])

    room5 = Room.objects.create(
        name='Training Room A',
        location='Kuningan, Jakarta',
        capacity=20,
        price_per_hour=200000,
        description='Spacious training room designed for workshops and seminars.',
    )
    room5.amenities.set([wifi, projector, whiteboard, ac])

    room6 = Room.objects.create(
        name='VIP Lounge',
        location='Senayan, Jakarta',
        capacity=8,
        price_per_hour=250000,
        description='Exclusive lounge area suitable for informal networking and high-level discussions.',
    )
    room6.amenities.set([wifi, coffee, projector, ac])

    print("Successfully seeded 6 rooms and amenities!")

if __name__ == '__main__':
    run_seed()
