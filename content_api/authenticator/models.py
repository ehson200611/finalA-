from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.utils import timezone

class AdminUserManager(BaseUserManager):
    def create_user(self, phoneNumber, password=None, **extra_fields):
        if not phoneNumber:
            raise ValueError("Users must have a phone number")
        user = self.model(phoneNumber=phoneNumber, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phoneNumber, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "superadmin")
        return self.create_user(phoneNumber, password, **extra_fields)


class AdminUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('superadmin', 'Super Admin'),
    ]
    
    name = models.CharField(max_length=255)
    phoneNumber = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    is_pdf = models.BooleanField(default=False)
    # Дополнительные поля
    email = models.EmailField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    notes = models.TextField(blank=True, help_text="Заметки администратора")
    updated_at = models.DateTimeField(auto_now=True)


    objects = AdminUserManager()

    USERNAME_FIELD = "phoneNumber"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return f"{self.name} ({self.role})"

    def is_superadmin(self):
        return self.role == 'superadmin' or self.is_superuser

    def is_admin(self):
        return self.role == 'admin' or self.is_superadmin()
    
    @property
    def is_pdf_from_profile(self):
        """Получает значение is_pdf из связанного UserProfile"""
        try:
            return self.userprofile.is_pdf
        except UserProfile.DoesNotExist:
            return False
    
    @is_pdf_from_profile.setter
    def is_pdf_from_profile(self, value):
        """Устанавливает значение is_pdf в связанный UserProfile"""
        try:
            profile = self.userprofile
            profile.is_pdf = value
            profile.pdf_updated_at = timezone.now()
            profile.save()
        except UserProfile.DoesNotExist:
            # Создаем профиль, если его нет
            UserProfile.objects.create(
                user=self,
                phone=self.phoneNumber,
                is_pdf=value,
                pdf_updated_at=timezone.now()
            )

class NotificationAdmin(models.Model):
    TYPE_CHOICES = [
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('read', 'Read')
    ]

    user = models.ForeignKey(AdminUser, on_delete=models.CASCADE, related_name="notifications")
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=6, null=True, blank=True)   # ⬅️ ИЛОВА ШУД
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} → {self.status}"




class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ], default='active')
    is_pdf = models.BooleanField(default=False)
    pdf_updated_at = models.DateTimeField(null=True, blank=True)

    @property
    def role(self):
        return self.user.role

    def get_tests(self):
        from tests.models import TestResult  # ✔ импорт дар дохили метод, на дар боло!
        return TestResult.objects.filter(profile=self).order_by("-dateCompleted")



class SMSCode(models.Model):
    PURPOSE_CHOICES = [
        ('register', 'Register'),
        ('reset_password', 'Reset Password'),
        ('notification', 'Notification'),  # ⬅️ ИЛОВА ШУД
    ]

    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='register')
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        from django.utils import timezone
        return (timezone.now() - self.created_at).total_seconds() > 300  # 5 дақиқа




