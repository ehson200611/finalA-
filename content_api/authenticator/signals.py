from django.db.models.signals import post_save
from django.dispatch import receiver

from authenticator.models import AdminUser, UserProfile

@receiver(post_save, sender=AdminUser)
def create_user_profile(sender, instance, created, **kwargs):
    """Эҷоди автоматӣ UserProfile барои ҳар AdminUser-и нав"""
    if created:
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={'phone': instance.phoneNumber}
        )

@receiver(post_save, sender=AdminUser)
def update_user_profile(sender, instance, **kwargs):
    """Навсозии UserProfile вақте ки AdminUser тағир дода мешавад"""
    if hasattr(instance, 'userprofile'):
        instance.userprofile.phone = instance.phoneNumber
        instance.userprofile.save()