from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.room_list, name='room-list'),
    path('bookings/', views.bookings, name='bookings'),  # ✅ GET + POST jadi satu
]