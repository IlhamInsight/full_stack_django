from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegisterView, CustomTokenObtainPairView, change_password,
    UserProfileViewSet, AmenityTypeViewSet, RoomAvailabilityViewSet,
    BlackoutDateViewSet, RoomViewSet, BookingViewSet, PaymentViewSet,
    InvoiceViewSet, NotificationViewSet, NotificationPreferenceViewSet,
    ReviewViewSet
)

router = DefaultRouter()

# Auth & User
router.register(r'auth/register', UserRegisterView, basename='register')
router.register(r'profile', UserProfileViewSet, basename='profile')

# Room Management
router.register(r'amenities', AmenityTypeViewSet, basename='amenity')
router.register(r'room-availability', RoomAvailabilityViewSet, basename='room-availability')
router.register(r'blackout-dates', BlackoutDateViewSet, basename='blackout-date')
router.register(r'rooms', RoomViewSet, basename='room')

# Booking & Payments
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

# Notifications
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notification-preference')

# Reviews
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # Token endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', change_password, name='change_password'),
    
    # Router URLs
    path('', include(router.urls)),
]