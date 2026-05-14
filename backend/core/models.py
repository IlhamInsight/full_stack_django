from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


# ==================== USER & PROFILE ====================
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True, verbose_name="Nama Lengkap")
    phone_number = models.CharField(max_length=20, blank=True, verbose_name="Nomor Telepon")
    address = models.TextField(blank=True, verbose_name="Alamat")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Avatar")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user', verbose_name="Role")
    is_email_verified = models.BooleanField(default=False, verbose_name="Email Terverifikasi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile {self.user.username}"

    class Meta:
        verbose_name = "Profil User"
        verbose_name_plural = "Profil User"


# ==================== ROOM & AMENITIES ====================
class AmenityType(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nama Fasilitas")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icon/Emoji")
    description = models.TextField(blank=True, verbose_name="Deskripsi")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Tipe Fasilitas"
        verbose_name_plural = "Tipe Fasilitas"


class Room(models.Model):
    STATUS_CHOICES = [
        ('active', 'Aktif'),
        ('maintenance', 'Maintenance'),
        ('inactive', 'Tidak Aktif'),
    ]

    name = models.CharField(max_length=100, verbose_name="Nama Ruangan")
    location = models.CharField(max_length=100, verbose_name="Lokasi")
    capacity = models.PositiveIntegerField(verbose_name="Kapasitas")
    description = models.TextField(blank=True, verbose_name="Deskripsi")
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Harga per Jam")
    is_available = models.BooleanField(default=True, verbose_name="Tersedia")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Status")
    amenities = models.ManyToManyField(AmenityType, blank=True, verbose_name="Fasilitas")
    image = models.ImageField(upload_to='rooms/', blank=True, null=True, verbose_name="Gambar Ruangan")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.location})"

    class Meta:
        verbose_name = "Ruangan"
        verbose_name_plural = "Ruangan"


class RoomAvailability(models.Model):
    DAY_CHOICES = [
        (0, 'Senin'),
        (1, 'Selasa'),
        (2, 'Rabu'),
        (3, 'Kamis'),
        (4, 'Jumat'),
        (5, 'Sabtu'),
        (6, 'Minggu'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='availability_rules', verbose_name="Ruangan")
    day_of_week = models.IntegerField(choices=DAY_CHOICES, verbose_name="Hari")
    opening_time = models.TimeField(default='08:00', verbose_name="Jam Buka")
    closing_time = models.TimeField(default='17:00', verbose_name="Jam Tutup")
    is_available = models.BooleanField(default=True, verbose_name="Tersedia")
    min_booking_hours = models.PositiveIntegerField(default=1, verbose_name="Min Jam Booking")
    max_booking_hours = models.PositiveIntegerField(default=8, verbose_name="Max Jam Booking")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room.name} - {self.get_day_of_week_display()}"

    class Meta:
        verbose_name = "Ketersediaan Ruangan"
        verbose_name_plural = "Ketersediaan Ruangan"
        unique_together = ['room', 'day_of_week']


class BlackoutDate(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='blackout_dates', verbose_name="Ruangan")
    date = models.DateField(verbose_name="Tanggal")
    reason = models.CharField(max_length=200, blank=True, verbose_name="Alasan")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room.name} - {self.date}"

    class Meta:
        verbose_name = "Tanggal Libur"
        verbose_name_plural = "Tanggal Libur"
        unique_together = ['room', 'date']


# ==================== BOOKING & PAYMENTS ====================
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Menunggu Persetujuan'),
        ('approved', 'Disetujui'),
        ('rejected', 'Ditolak'),
        ('cancelled', 'Dibatalkan'),
        ('completed', 'Selesai'),
    ]

    booking_code = models.CharField(max_length=20, unique=True, default='TEMP', verbose_name="Kode Booking")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', verbose_name="Pemesan")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings', verbose_name="Ruangan")
    booking_date = models.DateField(verbose_name="Tanggal Booking")
    start_time = models.TimeField(verbose_name="Jam Mulai")
    end_time = models.TimeField(verbose_name="Jam Selesai")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    notes = models.TextField(blank=True, verbose_name="Catatan")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Total Harga")
    attachment = models.FileField(upload_to='booking_attachments/', blank=True, null=True, verbose_name="Lampiran")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.booking_code == 'TEMP':
            self.booking_code = f"BK{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_code} - {self.user.username} - {self.room.name}"

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Booking"
        unique_together = ['room', 'booking_date', 'start_time', 'end_time']


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Tunai'),
        ('transfer', 'Transfer Bank'),
        ('card', 'Kartu Kredit'),
        ('gateway', 'Payment Gateway'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Menunggu Pembayaran'),
        ('verified', 'Terverifikasi'),
        ('rejected', 'Ditolak'),
        ('refunding', 'Sedang Diproses Refund'),
        ('refunded', 'Dikembalikan (Selesai)'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment', verbose_name="Booking")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Jumlah")
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, verbose_name="Metode Pembayaran")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    proof = models.ImageField(upload_to='payment_proofs/', blank=True, null=True, verbose_name="Bukti Pembayaran")
    notes = models.TextField(blank=True, verbose_name="Catatan")
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments', verbose_name="Diverifikasi oleh")
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name="Waktu Verifikasi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.booking.booking_code} - {self.status}"

    class Meta:
        verbose_name = "Pembayaran"
        verbose_name_plural = "Pembayaran"


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True, default='TEMP', verbose_name="Nomor Invoice")
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='invoice', verbose_name="Booking")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Jumlah")
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Pajak")
    total = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total")
    description = models.TextField(blank=True, verbose_name="Deskripsi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.invoice_number == 'TEMP':
            self.invoice_number = f"INV{timezone.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_number

    class Meta:
        verbose_name = "Invoice"
        verbose_name_plural = "Invoice"


# ==================== NOTIFICATIONS ====================
class Notification(models.Model):
    TYPE_CHOICES = [
        ('booking_pending', 'Booking Tertunda'),
        ('booking_approved', 'Booking Disetujui'),
        ('booking_rejected', 'Booking Ditolak'),
        ('booking_cancelled', 'Booking Dibatalkan'),
        ('payment_reminder', 'Reminder Pembayaran'),
        ('payment_verified', 'Pembayaran Terverifikasi'),
        ('payment_rejected', 'Pembayaran Ditolak'),
    ]

    CHANNEL_CHOICES = [
        ('in_app', 'Dalam Aplikasi'),
        ('email', 'Email'),
        ('sms', 'SMS'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="User")
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name="Tipe")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='in_app', verbose_name="Saluran")
    title = models.CharField(max_length=200, verbose_name="Judul")
    message = models.TextField(verbose_name="Pesan")
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="Booking")
    is_read = models.BooleanField(default=False, verbose_name="Sudah Dibaca")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Dibaca Pada")
    sent_at = models.DateTimeField(auto_now_add=True, verbose_name="Dikirim Pada")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()}"

    class Meta:
        verbose_name = "Notifikasi"
        verbose_name_plural = "Notifikasi"
        ordering = ['-created_at']


class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences', verbose_name="User")
    email_notifications = models.BooleanField(default=True, verbose_name="Notifikasi Email")
    sms_notifications = models.BooleanField(default=False, verbose_name="Notifikasi SMS")
    in_app_notifications = models.BooleanField(default=True, verbose_name="Notifikasi Dalam Aplikasi")
    booking_status_updates = models.BooleanField(default=True, verbose_name="Update Status Booking")
    payment_reminders = models.BooleanField(default=True, verbose_name="Reminder Pembayaran")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferensi Notifikasi {self.user.username}"

    class Meta:
        verbose_name = "Preferensi Notifikasi"
        verbose_name_plural = "Preferensi Notifikasi"


# ==================== REVIEWS & RATINGS ====================
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name="Pengguna")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reviews', verbose_name="Ruangan")
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='review', verbose_name="Booking")
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Rating"
    )
    comment = models.TextField(blank=True, verbose_name="Komentar")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review {self.user.username} untuk {self.room.name}"

    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Review"
        unique_together = ['user', 'room']
