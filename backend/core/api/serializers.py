from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from core.models import (
    UserProfile, Room, RoomAvailability, AmenityType, BlackoutDate,
    Booking, Payment, Invoice, Notification, NotificationPreference,
    Review
)


# ==================== AUTH & USER ====================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'full_name', 'phone_number',
            'address', 'avatar', 'role', 'is_email_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'profile']
        read_only_fields = ['id']

    def get_full_name(self, obj):
        try:
            return obj.profile.full_name or obj.username
        except:
            return obj.username


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'full_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password tidak cocok."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        full_name = validated_data.pop('full_name')
        
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, full_name=full_name)
        NotificationPreference.objects.create(user=user)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password tidak cocok."})
        return attrs


# ==================== ROOM & AMENITIES ====================
class AmenityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmenityType
        fields = ['id', 'name', 'icon', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class RoomAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = RoomAvailability
        fields = [
            'id', 'room', 'day_of_week', 'day_name', 'opening_time',
            'closing_time', 'is_available', 'min_booking_hours',
            'max_booking_hours', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BlackoutDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlackoutDate
        fields = ['id', 'room', 'date', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']


class RoomListSerializer(serializers.ModelSerializer):
    amenities = AmenityTypeSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'location', 'capacity', 'description',
            'price_per_hour', 'is_available', 'status', 'amenities',
            'image', 'average_rating', 'review_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(r.rating for r in reviews) / len(reviews)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()


class RoomDetailSerializer(serializers.ModelSerializer):
    amenities = AmenityTypeSerializer(many=True, read_only=True)
    availability_rules = RoomAvailabilitySerializer(many=True, read_only=True)
    blackout_dates = BlackoutDateSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'location', 'capacity', 'description',
            'price_per_hour', 'is_available', 'status', 'amenities',
            'image', 'availability_rules', 'blackout_dates', 'reviews',
            'average_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_reviews(self, obj):
        reviews = obj.reviews.all()[:5]
        return ReviewSerializer(reviews, many=True).data

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(r.rating for r in reviews) / len(reviews)
        return 0


# ==================== BOOKING & PAYMENTS ====================
class BookingListSerializer(serializers.ModelSerializer):
    room_name = serializers.ReadOnlyField(source='room.name')
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    has_payment = serializers.SerializerMethodField()
    payment_status = serializers.ReadOnlyField(source='payment.status')

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_code', 'user', 'user_name', 'room', 'room_name',
            'booking_date', 'start_time', 'end_time', 'status', 'status_display',
            'total_price', 'has_payment', 'payment_status', 'created_at'
        ]
        read_only_fields = ['id', 'booking_code', 'total_price', 'created_at']

    def get_user_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    def get_has_payment(self, obj):
        return hasattr(obj, 'payment')


class BookingDetailSerializer(serializers.ModelSerializer):
    room_details = RoomListSerializer(source='room', read_only=True)
    user_details = UserDetailSerializer(source='user', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment = serializers.SerializerMethodField()
    has_payment = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_code', 'user', 'user_details', 'room', 'room_details',
            'booking_date', 'start_time', 'end_time', 'status', 'status_display',
            'notes', 'total_price', 'attachment', 'payment', 'has_payment',
            'invoice', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_code', 'total_price', 'created_at', 'updated_at']

    def get_payment(self, obj):
        if hasattr(obj, 'payment'):
            return PaymentSerializer(obj.payment).data
        return None

    def get_has_payment(self, obj):
        return hasattr(obj, 'payment')

    def get_invoice(self, obj):
        try:
            return InvoiceSerializer(obj.invoice).data
        except Invoice.DoesNotExist:
            return None


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'room', 'booking_date', 'start_time', 'end_time',
            'notes', 'attachment'
        ]

    def validate(self, data):
        room = data['room']
        booking_date = data['booking_date']
        start_time = data['start_time']
        end_time = data['end_time']
        
        # 1. Check end time > start time
        if end_time <= start_time:
            raise serializers.ValidationError("Waktu selesai harus setelah waktu mulai.")
            
        # 2. Check for conflicts
        from ..models import Booking
        conflicts = Booking.objects.filter(
            room=room,
            booking_date=booking_date,
            status__in=['approved', 'pending']
        ).exclude(status__in=['rejected', 'cancelled'])
        
        from datetime import datetime
        start_dt = datetime.combine(booking_date, start_time)
        end_dt = datetime.combine(booking_date, end_time)
        
        for booking in conflicts:
            b_start = datetime.combine(booking.booking_date, booking.start_time)
            b_end = datetime.combine(booking.booking_date, booking.end_time)
            
            if not (end_dt <= b_start or start_dt >= b_end):
                raise serializers.ValidationError(
                    f"Ruangan sudah dipesan pada waktu tersebut ({booking.start_time} - {booking.end_time})."
                )
        
        return data

    def create(self, validated_data):
        # Ensure user is from the request
        validated_data['user'] = self.context['request'].user
        
        # Calculate total price
        room = validated_data['room']
        start_time = validated_data['start_time']
        end_time = validated_data['end_time']
        
        # Calculate hours
        from datetime import datetime
        # We only need the time difference, date doesn't matter for duration
        start = datetime.combine(datetime.today(), start_time)
        end = datetime.combine(datetime.today(), end_time)
        hours = (end - start).total_seconds() / 3600
        
        from decimal import Decimal
        validated_data['total_price'] = room.price_per_hour * Decimal(str(hours))
        
        return super().create(validated_data)


class PaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount', 'method', 'method_display', 'status',
            'status_display', 'proof', 'notes', 'verified_by', 'verified_by_name',
            'verified_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'amount', 'verified_by', 'verified_at', 'created_at', 'updated_at'
        ]

    def get_verified_by_name(self, obj):
        if obj.verified_by:
            try:
                return obj.verified_by.profile.full_name or obj.verified_by.username
            except:
                return obj.verified_by.username
        return None


class InvoiceSerializer(serializers.ModelSerializer):
    booking_details = BookingListSerializer(source='booking', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'booking', 'booking_details',
            'amount', 'tax', 'total', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at', 'updated_at']


# ==================== NOTIFICATIONS ====================
class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'type_display', 'channel', 'channel_display',
            'title', 'message', 'booking', 'is_read', 'read_at', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'sent_at', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'email_notifications', 'sms_notifications',
            'in_app_notifications', 'booking_status_updates', 'payment_reminders',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


# ==================== REVIEWS & OTHERS ====================
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    room_name = serializers.ReadOnlyField(source='room.name')

    def get_user_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'room', 'room_name', 'booking',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'helpful_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'comment': {'required': False, 'allow_blank': True},
            'booking': {'required': False, 'allow_null': True}
        }
