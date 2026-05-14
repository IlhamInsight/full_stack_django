from django.contrib import admin
from django.utils.html import format_html
from .models import (
    UserProfile, Room, RoomAvailability, AmenityType, BlackoutDate,
    Booking, Payment, Invoice, Notification, NotificationPreference,
    Review
)
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User


# ==================== USER & PROFILE ====================
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profil Lengkap'
    fk_name = 'user'

# Unregister default User Admin
admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline, )
    list_display = ('username', 'email', 'get_full_name', 'is_staff')
    
    def get_full_name(self, obj):
        try:
            return obj.profile.full_name
        except:
            return "-"
    get_full_name.short_description = 'Nama Lengkap'

    # Menghapus first_name dan last_name dari tampilan edit
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informasi Pribadi', {'fields': ('email',)}),
        ('Hak Akses', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Waktu Penting', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'role', 'phone_number', 'is_email_verified')
    list_filter = ('role', 'is_email_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'role', 'is_email_verified')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'phone_number', 'address', 'avatar')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ==================== ROOM & AMENITIES ====================
@admin.register(AmenityType)
class AmenityTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'description')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'price_per_hour', 'status', 'is_available', 'rating_display')
    list_filter = ('status', 'is_available', 'location', 'created_at')
    search_fields = ('name', 'description', 'location')
    readonly_fields = ('created_at', 'updated_at', 'rating_display')
    fieldsets = (
        ('Room Info', {
            'fields': ('name', 'location', 'capacity', 'description')
        }),
        ('Pricing & Availability', {
            'fields': ('price_per_hour', 'is_available', 'status')
        }),
        ('Facilities', {
            'fields': ('amenities',)
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Rating', {
            'fields': ('rating_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    filter_horizontal = ('amenities',)

    def rating_display(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            avg = sum(r.rating for r in reviews) / len(reviews)
            return f"{avg:.1f}/5 ({len(reviews)} reviews)"
        return "Belum ada review"
    rating_display.short_description = "Rating"


@admin.register(RoomAvailability)
class RoomAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('room', 'day_name', 'opening_time', 'closing_time', 'is_available')
    list_filter = ('day_of_week', 'is_available', 'room')
    readonly_fields = ('created_at',)

    def day_name(self, obj):
        return obj.get_day_of_week_display()
    day_name.short_description = "Hari"


@admin.register(BlackoutDate)
class BlackoutDateAdmin(admin.ModelAdmin):
    list_display = ('room', 'date', 'reason')
    list_filter = ('room', 'date')
    search_fields = ('room__name', 'reason')
    readonly_fields = ('created_at',)


# ==================== BOOKING & PAYMENTS ====================
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_code', 'user', 'room', 'booking_date', 'time_display', 'status_badge', 'total_price')
    list_filter = ('status', 'booking_date', 'room', 'created_at')
    search_fields = ('user__username', 'room__name', 'booking_code', 'notes')
    readonly_fields = ('booking_code', 'total_price', 'created_at', 'updated_at')
    fieldsets = (
        ('Booking Info', {
            'fields': ('booking_code', 'user', 'room', 'status')
        }),
        ('Date & Time', {
            'fields': ('booking_date', 'start_time', 'end_time')
        }),
        ('Payment Info', {
            'fields': ('total_price', 'attachment')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    raw_id_fields = ('user', 'room')
    actions = ['mark_approved', 'mark_rejected', 'mark_cancelled', 'mark_completed']

    def time_display(self, obj):
        return f"{obj.start_time} - {obj.end_time}"
    time_display.short_description = "Waktu"

    def status_badge(self, obj):
        colors = {
            'pending': '#ff9900',
            'approved': '#00cc00',
            'rejected': '#cc0000',
            'cancelled': '#999999',
            'completed': '#0066cc',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#999999'),
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def mark_approved(self, request, queryset):
        queryset.update(status='approved')
    mark_approved.short_description = "Setujui booking terpilih"

    def mark_rejected(self, request, queryset):
        queryset.update(status='rejected')
    mark_rejected.short_description = "Tolak booking terpilih"

    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
    mark_cancelled.short_description = "Batalkan booking terpilih"

    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_completed.short_description = "Selesaikan booking terpilih"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'method', 'status_badge', 'get_verified_by', 'created_at')
    list_filter = ('status', 'method', 'created_at', 'verified_at')
    search_fields = ('booking__booking_code', 'booking__user__username')
    readonly_fields = ('created_at', 'updated_at', 'verified_at')
    fieldsets = (
        ('Payment Info', {
            'fields': ('booking', 'amount', 'method', 'status')
        }),
        ('Proof', {
            'fields': ('proof',)
        }),
        ('Verification', {
            'fields': ('verified_by', 'verified_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    raw_id_fields = ('booking', 'verified_by')
    actions = ['verify_payment', 'reject_payment']

    def get_verified_by(self, obj):
        if obj.verified_by:
            return f"{obj.verified_by.profile.full_name} ({obj.verified_by.username})" if obj.verified_by.profile.full_name else obj.verified_by.username
        return "-"
    get_verified_by.short_description = "Diverifikasi oleh"

    def status_badge(self, obj):
        colors = {
            'pending': '#ff9900',
            'verified': '#00cc00',
            'rejected': '#cc0000',
            'refunded': '#0066cc',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#999999'),
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def verify_payment(self, request, queryset):
        queryset.update(status='verified', verified_by=request.user)
    verify_payment.short_description = "Verifikasi pembayaran"

    def reject_payment(self, request, queryset):
        queryset.update(status='rejected')
    reject_payment.short_description = "Tolak pembayaran"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'booking', 'total', 'created_at')
    list_filter = ('created_at', 'booking__room')
    search_fields = ('invoice_number', 'booking__booking_code')
    readonly_fields = ('invoice_number', 'created_at', 'updated_at')
    fieldsets = (
        ('Invoice Info', {
            'fields': ('invoice_number', 'booking')
        }),
        ('Amount', {
            'fields': ('amount', 'tax', 'total')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    raw_id_fields = ('booking',)


# ==================== NOTIFICATIONS ====================
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'channel', 'is_read', 'sent_at')
    list_filter = ('type', 'channel', 'is_read', 'sent_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('sent_at', 'created_at')
    fieldsets = (
        ('Notification Info', {
            'fields': ('user', 'type', 'channel')
        }),
        ('Content', {
            'fields': ('title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'booking')
        }),
        ('Timestamps', {
            'fields': ('sent_at', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    raw_id_fields = ('user', 'booking')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'sms_notifications', 'in_app_notifications')
    list_filter = ('email_notifications', 'sms_notifications', 'in_app_notifications')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


# ==================== REVIEWS ====================
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'rating_stars', 'created_at')
    list_filter = ('rating', 'room', 'created_at')
    search_fields = ('user__username', 'room__name', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Review Info', {
            'fields': ('user', 'room', 'booking')
        }),
        ('Rating & Comment', {
            'fields': ('rating', 'comment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    raw_id_fields = ('user', 'room', 'booking')

    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return f"{stars} ({obj.rating}/5)"
    rating_stars.short_description = "Rating"
