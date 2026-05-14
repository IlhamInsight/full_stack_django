from rest_framework.decorators import api_view
from rest_framework.response import Response
from .api.serializers import RoomSerializer, BookingSerializer
from .models import Room, Booking
from django.contrib.auth.models import User


@api_view(['GET'])
def room_list(request):
    rooms = Room.objects.all()
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def bookings(request):
    if request.method == 'GET':
        bookings = Booking.objects.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        print("=== DATA DITERIMA DARI REACT ===")
        print(request.data)
        print("================================")

        serializer = BookingSerializer(data=request.data)

        if serializer.is_valid():
            user = User.objects.first()
            if not user:
                return Response(
                    {"error": "User belum ada. Buat superuser dulu!"},
                    status=400
                )

            booking = serializer.save(user=user)
            print(f"✅ Booking berhasil! ID: {booking.id}")

            return Response(serializer.data, status=201)

        print("❌ Serializer Error:", serializer.errors)
        return Response(serializer.errors, status=400)