from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment, Notification

@receiver(post_save, sender=Payment)
def payment_status_notification(sender, instance, created, **kwargs):
    if not created:
        # Check if status has changed
        # Note: In a production app, you might want to use a package like django-model-utils 
        # or track the field yourself. For simplicity here, we'll trigger based on specific statuses.
        
        if instance.status == 'verified':
            Notification.objects.get_or_create(
                user=instance.booking.user,
                type='payment_verified',
                booking=instance.booking,
                title='Pembayaran Terverifikasi',
                message=f'Pembayaran Anda untuk {instance.booking.room.name} telah diverifikasi.'
            )
        elif instance.status == 'rejected':
            Notification.objects.get_or_create(
                user=instance.booking.user,
                type='payment_rejected',
                booking=instance.booking,
                title='Pembayaran Ditolak',
                message='Pembayaran Anda ditolak. Silakan upload bukti pembayaran yang valid.'
            )
        elif instance.status == 'refunded':
            Notification.objects.get_or_create(
                user=instance.booking.user,
                type='payment_verified', # Reuse or add new type
                booking=instance.booking,
                title='Refund Selesai',
                message=f'Pengembalian dana untuk booking {instance.booking.room.name} telah selesai dilakukan.'
            )
        elif instance.status == 'refunding':
            Notification.objects.get_or_create(
                user=instance.booking.user,
                type='payment_verified',
                booking=instance.booking,
                title='Refund Sedang Diproses',
                message=f'Permintaan pengembalian dana Anda sedang diproses oleh admin.'
            )
