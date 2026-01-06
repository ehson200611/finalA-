# authenticator/simple_views.py (исправленная версия)
from rest_framework.exceptions import ValidationError
from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import AdminUser, NotificationAdmin, UserProfile
from .serializers import (
    AdminUserSetPasswordSerializer, ForgotPasswordSerializer, RegisterSerializer, LoginSerializer, NotificationSerializer, ResetPasswordSerializer, SendCodeSerializer, 
    UserProfileSerializer, UserProfilePDFSerializer, AdminUserListSerializer, AdminUserDetailSerializer,
    AdminUserUpdateRoleSerializer, TestAdminSerializer
)
from .permissions import IsSuperAdmin, IsAdminOrSuperAdmin, IsOwnerOrAdmin
from rest_framework.views import APIView
from tests.models import TestResult
from .token import get_tokens_for_user  # Ҷойи функсияи тавлиди токен
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema

from authenticator import models


User = get_user_model()

# --- РЕГИСТРАЦИЯ ---
from drf_spectacular.utils import extend_schema
from .serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
        description="Register new user using phone verification code"
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        password = serializer.validated_data['password']
        name = serializer.validated_data['name']


        # 🚨 check SMS code
        try:
            sms = SMSCode.objects.filter(phone=phone).latest('created_at')
        except SMSCode.DoesNotExist:
            return Response({"error": "Code not found"}, status=400)

        if sms.code != code:
            return Response({"error": "Invalid code"}, status=400)

        # create user
        user = User.objects.create_user(
            phoneNumber=phone,
            password=password,
            name=name 
        )

        return Response({"message": "User registered"}, status=201)


# --- АВТОРИЗАЦИЯ ---
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .serializers import LoginSerializer
from .token import get_tokens_for_user  # Ҷойи функсияи тавлиди токен

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        # 1. Сериализатсия кардани маълумот
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phoneNumber']
        password = serializer.validated_data['password']

        # 2. Верификация кардани корбар
        try:
            user = authenticate(phoneNumber=phone_number, password=password)
        except:
            return Response({"error": "Invalid credentials"}, status=400)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        # 3. Агар корбар дуруст бошад, токенҳо месозем
        if user.is_active:
            tokens = get_tokens_for_user(user)

            return Response({
                "refresh": tokens["refresh"],  # Refresh token
                "access": tokens["access"],  # Access token
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "phoneNumber": user.phoneNumber,
                    "role": user.role,
                    "is_active": user.is_active
                }
            }, status=200)

        return Response({"error": "Account is deactivated"}, status=400)



# --- ОТДЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЕЙ ---

def get_superadmins(request):
    """Отдельная функция для получения суперадминов"""
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if request.user.role != 'superadmin' and not request.user.is_superuser:
        return Response(
            {"error": "Only superadmins can view superadmins list"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    superadmins = AdminUser.objects.filter(role="superadmin").order_by('-date_joined')
    serializer = AdminUserListSerializer(superadmins, many=True)
    
    return Response({
        "count": superadmins.count(),
        "superadmins": serializer.data
    })

def get_admins(request):
    """Отдельная функция для получения админов"""
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if request.user.role not in ['superadmin', 'admin'] and not request.user.is_superuser:
        return Response(
            {"error": "Only admins can view admins list"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Суперадмины видят всех админов
    if request.user.role == 'superadmin' or request.user.is_superuser:
        admins = AdminUser.objects.filter(role="admin").order_by('-date_joined')
    # Обычные админы видят только других админов (но не себя)
    else:
        admins = AdminUser.objects.filter(
            role="admin"
        ).exclude(id=request.user.id).order_by('-date_joined')
    
    serializer = AdminUserListSerializer(admins, many=True)
    
    return Response({
        "count": admins.count(),
        "admins": serializer.data
    })

def get_regular_users(request):
    """Отдельная функция для получения обычных пользователей"""
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if request.user.role not in ['superadmin', 'admin'] and not request.user.is_superuser:
        return Response(
            {"error": "Only admins can view regular users list"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    regular_users = AdminUser.objects.filter(role="user").order_by('-date_joined')
    serializer = AdminUserListSerializer(regular_users, many=True)
    
    return Response({
        "count": regular_users.count(),
        "regular_users": serializer.data
    })

# --- VIEWSET ДЛЯ УПРАВЛЕНИЯ АДМИНАМИ ---
# simple_views.py

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = AdminUser.objects.all().order_by('-date_joined')
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsSuperAdmin]
        elif self.action == 'list':
            permission_classes = [IsAdminOrSuperAdmin]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrAdmin | IsSuperAdmin]
        elif self.action in ['update_role', 'activate_user', 'deactivate_user']:
            permission_classes = [IsSuperAdmin]
        elif self.action in ['toggle_pdf', 'set_password']:
            permission_classes = [IsAdminOrSuperAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminUserListSerializer
        elif self.action == 'update_role':
            return AdminUserUpdateRoleSerializer
        elif self.action == 'set_password':
            return AdminUserSetPasswordSerializer
        return AdminUserDetailSerializer

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return AdminUser.objects.none()
        
        if user.role == 'superadmin' or user.is_superuser:
            return AdminUser.objects.all().order_by('-date_joined')
        elif user.role == 'admin':
            return AdminUser.objects.exclude(role='superadmin').order_by('-date_joined')
        else:
            return AdminUser.objects.filter(id=user.id)

    def create(self, request, *args, **kwargs):
        """
        Create a new admin user (only for superadmins)
        """
        serializer = AdminUserDetailSerializer(data=request.data)
        if serializer.is_valid():
            # Check if phone number already exists
            if AdminUser.objects.filter(phoneNumber=serializer.validated_data['phoneNumber']).exists():
                return Response(
                    {"error": "User with this phone number already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = AdminUser.objects.create_user(
                phoneNumber=serializer.validated_data['phoneNumber'],
                name=serializer.validated_data['name'],
                password=request.data.get('password', 'defaultpassword123'),  # Default password
                role=serializer.validated_data.get('role', 'user'),
                is_active=serializer.validated_data.get('is_active', True)
            )
            
            return Response(
                AdminUserDetailSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Update admin user (partial update allowed)
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check permissions for role change
        if 'role' in request.data and instance.role != request.data['role']:
            if not (request.user.role == 'superadmin' or request.user.is_superuser):
                return Response(
                    {"error": "Only superadmins can change user roles"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = AdminUserDetailSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Handle password update if provided
        if 'password' in request.data:
            instance.set_password(request.data['password'])
        
        self.perform_update(serializer)
        
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='update-role')
    def update_role(self, request, pk=None):
        """
        Update user role (only for superadmins)
        URL: PATCH /api/users/{id}/update-role/
        Body: {"role": "admin"}
        """
        user = self.get_object()
        
        if user.id == request.user.id:
            return Response(
                {"error": "Cannot change your own role"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AdminUserUpdateRoleSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": f"User role updated to {serializer.validated_data['role']}",
            "user": AdminUserDetailSerializer(user).data
        })

    @action(detail=True, methods=['post'], url_path='activate')
    def activate_user(self, request, pk=None):
        """
        Activate user account
        URL: POST /api/users/{id}/activate/
        """
        user = self.get_object()
        user.is_active = True
        user.save()

        return Response({
            "message": "User activated successfully",
            "user": AdminUserDetailSerializer(user).data
        })

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate_user(self, request, pk=None):
        """
        Deactivate user account
        URL: POST /api/users/{id}/deactivate/
        """
        user = self.get_object()
        
        if user.id == request.user.id:
            return Response(
                {"error": "Cannot deactivate your own account"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = False
        user.save()

        return Response({
            "message": "User deactivated successfully",
            "user": AdminUserDetailSerializer(user).data
        })

    @action(detail=True, methods=['post'], url_path='toggle-pdf')
    def toggle_pdf(self, request, pk=None):
        """
        Toggle PDF status for a specific user
        URL: POST /api/users/{id}/toggle-pdf/
        """
        user = self.get_object()
        
        # Санҷидани иҷозат
        if not (request.user.role in ['superadmin', 'admin'] or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Пайдо кардани профили корбар
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            # Агар профил вуҷуд надошта бошад, эҷод мекунем
            profile = UserProfile.objects.create(
                user=user,
                phone=user.phoneNumber,
                status='active',
                is_pdf=False
            )
        
        # Toggle кардани статуси PDF
        profile.is_pdf = not profile.is_pdf
        profile.pdf_updated_at = timezone.now()
        profile.save()
        
        # Ҳамонгсозии AdminUser.is_pdf
        user.is_pdf = profile.is_pdf
        user.save()
        
        return Response({
            "message": f"PDF status toggled to {profile.is_pdf}",
            "user": AdminUserDetailSerializer(user).data,
            "is_pdf": profile.is_pdf,
            "pdf_updated_at": profile.pdf_updated_at
        })

    @action(detail=True, methods=['post'], url_path='set-password')
    def set_password(self, request, pk=None):
        """
        Set new password for user
        URL: POST /api/users/{id}/set-password/
        Body: {"password": "newpassword", "password_confirm": "newpassword"}
        """
        user = self.get_object()
        
        # Санҷидани иҷозат
        if not (request.user.role in ['superadmin', 'admin'] or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        
        if not password or not password_confirm:
            return Response(
                {"error": "Both password and password_confirm are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if password != password_confirm:
            return Response(
                {"error": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 6:
            return Response(
                {"error": "Password must be at least 6 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(password)
        user.save()
        
        return Response({
            "message": "Password updated successfully",
            "user": AdminUserDetailSerializer(user).data
        })

    @action(detail=False, methods=['get'], url_path='by-role')
    def get_users_by_role(self, request):
        """
        Get users filtered by role
        URL: GET /api/users/by-role/?role=admin
        """
        role = request.query_params.get('role')
        
        if not role:
            return Response(
                {"error": "Role parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if role not in ['user', 'admin', 'superadmin']:
            return Response(
                {"error": "Invalid role. Must be one of: user, admin, superadmin"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(role=role)
        serializer = AdminUserListSerializer(queryset, many=True)
        
        return Response({
            "count": queryset.count(),
            "users": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='search')
    def search_users(self, request):
        """
        Search users by name or phone number
        URL: GET /api/users/search/?q=search_term
        """
        search_term = request.query_params.get('q', '').strip()
        
        if not search_term:
            return Response(
                {"error": "Search term (q parameter) is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            models.Q(name__icontains=search_term) |
            models.Q(phoneNumber__icontains=search_term)
        )
        
        serializer = AdminUserListSerializer(queryset, many=True)
        
        return Response({
            "count": queryset.count(),
            "search_term": search_term,
            "users": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='pdf-users')
    def pdf_users(self, request):
        """
        Get all users with PDF enabled
        URL: GET /api/users/pdf-users/
        """
        queryset = self.get_queryset().filter(is_pdf=True)
        serializer = AdminUserListSerializer(queryset, many=True)
        
        return Response({
            "count": queryset.count(),
            "users": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='non-pdf-users')
    def non_pdf_users(self, request):
        """
        Get all users with PDF disabled
        URL: GET /api/users/non-pdf-users/
        """
        queryset = self.get_queryset().filter(is_pdf=False)
        serializer = AdminUserListSerializer(queryset, many=True)
        
        return Response({
            "count": queryset.count(),
            "users": serializer.data
        })

    @action(detail=True, methods=['get'], url_path='profile')
    def get_user_profile(self, request, pk=None):
        """
        Get user profile details
        URL: GET /api/users/{id}/profile/
        """
        user = self.get_object()
        
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Create profile if doesn't exist
            profile = UserProfile.objects.create(
                user=user,
                phone=user.phoneNumber,
                status='active',
                is_pdf=user.is_pdf
            )
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- VIEW ДЛЯ ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ ---
# simple_views.py

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAdminOrSuperAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsOwnerOrAdmin]
        elif self.action == 'create':
            permission_classes = [IsSuperAdmin]
        else:
            permission_classes = [IsSuperAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return UserProfile.objects.none()
        
        if user.role in ['superadmin', 'admin'] or user.is_superuser:
            return UserProfile.objects.all()
        
        return UserProfile.objects.filter(user=user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        profile = self.get_object()
        new_status = request.data.get("status")

        if new_status not in ["active", "inactive", "pending"]:
            return Response({"error": "Invalid status"}, status=400)

        profile.status = new_status
        profile.save()

        return Response({
            "message": "Status updated",
            "profile": UserProfileSerializer(profile).data
        })

    @action(detail=True, methods=['patch'], url_path='update-pdf-status')
    def update_pdf_status(self, request, pk=None):
        profile = self.get_object()
        
        serializer = UserProfilePDFSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            profile_serializer = UserProfileSerializer(profile)
            return Response({
                "message": "PDF status updated successfully",
                "profile": profile_serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='pdf-profiles')
    def pdf_profiles(self, request):
        queryset = self.get_queryset().filter(is_pdf=True)
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='non-pdf-profiles')
    def non_pdf_profiles(self, request):
        queryset = self.get_queryset().filter(is_pdf=False)
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='toggle-pdf')
    def toggle_pdf_by_profile(self, request, pk=None):
        """
        Toggle PDF status for a specific profile (using profile ID)
        URL: POST /api/profiles/{profile_id}/toggle-pdf/
        """
        # pk ин ҷо profile_id аст
        try:
            profile = self.get_object()  # Ин профилро бо pk (profile_id) мегирад
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Санҷидани иҷозат
        if not (request.user.role in ['superadmin', 'admin'] or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle кардани статуси PDF
        profile.is_pdf = not profile.is_pdf
        profile.pdf_updated_at = timezone.now()
        profile.save()
        
        # Ҳамонгсозии AdminUser.is_pdf
        user = profile.user
        user.is_pdf = profile.is_pdf
        user.save()
        
        return Response({
            "message": f"PDF status toggled to {profile.is_pdf} for user {user.name}",
            "profile_id": profile.id,
            "user_id": user.id,
            "user_name": user.name,
            "is_pdf": profile.is_pdf,
            "pdf_updated_at": profile.pdf_updated_at
        })

    @action(detail=False, methods=['post'], url_path='toggle-pdf-by-user')
    def toggle_pdf_by_user_id(self, request):
        """
        Toggle PDF status by user ID from request body
        URL: POST /api/profiles/toggle-pdf-by-user/
        Body: {"user_id": 123}
        """
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id is required in request body"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Пайдо кардани корбар бо ID-и додашуда
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return self._toggle_pdf_for_user(user, request)

    @action(detail=False, methods=['post'], url_path='toggle-pdf-by-user/(?P<user_id>[^/.]+)')
    def toggle_pdf_by_user_url(self, request, user_id=None):
        """
        Toggle PDF status by user ID from URL parameter
        URL: POST /api/profiles/toggle-pdf-by-user/{user_id}/
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return self._toggle_pdf_for_user(user, request)

    def _toggle_pdf_for_user(self, user, request):
        """
        Функсияи хусусӣ барои toggle кардани PDF барои корбари муайян
        """
        # Санҷидани иҷозат
        if not (request.user.role in ['superadmin', 'admin'] or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Пайдо кардани профили корбар
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            # Агар профил вуҷуд надошта бошад, эҷод мекунем
            profile = UserProfile.objects.create(
                user=user,
                phone=user.phoneNumber,
                status='active',
                is_pdf=False
            )
        
        # Toggle кардани статуси PDF
        profile.is_pdf = not profile.is_pdf
        profile.pdf_updated_at = timezone.now()
        profile.save()
        
        # Ҳамонгсозии AdminUser.is_pdf
        user.is_pdf = profile.is_pdf
        user.save()
        
        return Response({
            "message": f"PDF status toggled to {profile.is_pdf} for user {user.name}",
            "user_id": user.id,
            "user_name": user.name,
            "is_pdf": profile.is_pdf,
            "pdf_updated_at": profile.pdf_updated_at
        })


# --- ТЕКУЩИЙ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ---
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        try:
            return UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            return UserProfile.objects.create(
                user=self.request.user,
                phone=self.request.user.phoneNumber,
                status='active'
            )




# --- УВЕДОМЛЕНИЯ ---
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = NotificationAdmin.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]  # Танҳо логиншудаҳо
        elif self.action == 'create':
            permission_classes = [AllowAny]  # Ҳар кас метавонад эҷод кунад
        else:
            permission_classes = [AllowAny]  # Ё экшнҳои дигар
        return [permission() for permission in permission_classes]



    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return NotificationAdmin.objects.none()
        
        if user.role in ['superadmin', 'admin'] or user.is_superuser:
            return NotificationAdmin.objects.all().order_by("-date")
        
        return NotificationAdmin.objects.filter(user=user).order_by("-date")

    def perform_create(self, serializer):
        code = self.request.data.get("code")

        # Агар code фиристода нашуда бошад
        if not code:
            raise ValidationError({"error": "Code is required"})

        # Ҷустуҷӯи охирин SMS бо мақсади notification
        try:
            sms = SMSCode.objects.filter(
                purpose="notification"
            ).latest("created_at")
        except SMSCode.DoesNotExist:
            raise ValidationError({"error": "Notification code not found"})

        # Проверка кода
        if sms.code != code:
            raise ValidationError({"error": "Invalid notification code"})

        # Проверка истечение срока
        if sms.is_expired():
            raise ValidationError({"error": "Notification code expired"})

        # Агар код дуруст бошад — notification сохта мешавад
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.status = "read"
        notification.save()
        return Response({"message": "Notification marked as read"})

    @action(detail=True, methods=['post'], url_path="mark-unread")
    def mark_unread(self, request, pk=None):
        notification = self.get_object()
        notification.status = "unread"
        notification.save()
        return Response({"message": "Notification marked as unread"})

# --- API VIEW ДЛЯ ОТДЕЛЬНЫХ ФУНКЦИЙ ---

class SuperAdminListAPIView(APIView):
    """API View для получения списка суперадминов"""
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        return get_superadmins(request)

class AdminListAPIView(APIView):
    """API View для получения списка админов"""
    permission_classes = [IsAdminOrSuperAdmin]
    
    def get(self, request):
        return get_admins(request)

class RegularUsersListAPIView(APIView):
    """API View для получения списка обычных пользователей"""
    permission_classes = [IsAdminOrSuperAdmin]
    
    def get(self, request):
        return get_regular_users(request)

# --- ТЕСТЫ АДМИНИСТРАТОРА ---
class TestAdminViewSet(viewsets.ModelViewSet):
    serializer_class = TestAdminSerializer
    queryset = TestResult.objects.all().order_by("-dateCompleted")
    
    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [IsAdminOrSuperAdmin]
        else:
            permission_classes = [IsAdminOrSuperAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return TestResult.objects.none()
        
        if user.role == 'superadmin' or user.is_superuser:
            return TestResult.objects.all().order_by("-dateCompleted")
        elif user.role == 'admin':
            return TestResult.objects.all().order_by("-dateCompleted")
        
        return TestResult.objects.filter(profile__user=user).order_by("-dateCompleted")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = TestAdminSerializer(queryset, many=True).data
        return Response({"testAdmin": data})

    def create(self, request, *args, **kwargs):
        serializer = TestAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"created": serializer.data}, status=201)

# --- ТЕКУЩИЕ УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ---  
class CurrentUserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationAdmin.objects.filter(user=self.request.user).order_by("-date")
    



from drf_spectacular.utils import extend_schema

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=ForgotPasswordSerializer,
        responses={200: OpenApiTypes.OBJECT},
        description="Verify phone number and allow user to reset password"
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phoneNumber']

        # Check user exists
        if not AdminUser.objects.filter(phoneNumber=phone).exists():
            return Response({"error": "User not found"}, status=404)

        return Response({"message": "Phone verified. You may reset password now"})





class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={200: OpenApiTypes.OBJECT},
        description="Reset password using phone number only"
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phoneNumber']
        password = serializer.validated_data['password']

        try:
            user = AdminUser.objects.get(phoneNumber=phone)
        except AdminUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.set_password(password)
        user.save()

        return Response({"message": "Password reset successfully"})



import random
from .sms_service import format_sms_code, send_sms_code
from .models import SMSCode

class SendCodeView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=SendCodeSerializer,
        responses={200: OpenApiTypes.OBJECT},
        description="Send SMS verification code to user's phone number. Purpose can be 'register' or 'reset_password'."
    )
    def post(self, request):
        serializer = SendCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phoneNumber']
        purpose = serializer.validated_data.get('purpose', 'register')  # default if not provided
        code = str(random.randint(100000, 999999))

        # Формат ва фиристодани SMS
        msg = format_sms_code(phone, code, purpose)
        SMSCode.objects.create(phone=phone, code=code, purpose=purpose)
        send_sms_code(phone, msg)

        return Response({
            "message": f"Verification code for {purpose} sent successfully",
            "phone": phone,
            "purpose": purpose
        })
    

class SendNotificationSMSView(APIView):
    """
    Аввал CODE-ро месанҷад → агар дуруст бошад → SMS notification мефиристад
    """

    def post(self, request):
        phone = request.data.get("phoneNumber")
        input_code = request.data.get("code")
        purpose = request.data.get("purpose", "notification")

        if not phone or not input_code:
            return Response({"error": "phoneNumber and code are required"}, status=400)

        # 1) Ҷустуҷӯи код
        try:
            sms = SMSCode.objects.filter(
                phone=phone,
                purpose='notification'
            ).latest("created_at")
        except SMSCode.DoesNotExist:
            return Response({"error": "Code not found"}, status=404)

        # 2) Санҷиши код
        if sms.code != input_code:
            return Response({"error": "Invalid code"}, status=400)

        if sms.is_expired():
            return Response({"error": "Code expired"}, status=400)

        # 3) Иҷозат барои фиристодани SMS
        # (ИН ҶО ШУМО РЕАЛ SMS API МЕГУЗОРЕД)

        # --- МИСОЛИ ФИРСТОДАНИ SMS ---
        # send_sms(phone, "Your notification is confirmed!")
        # -----------------------------

        # 4) Эҷоди Notification дар база
        notification = NotificationAdmin.objects.create(
            user=request.user,
            name="Code verified",
            title="Notification sent successfully",
            code=input_code,
            type="success"
        )

        return Response({
            "message": "SMS sent successfully",
            "notification": NotificationSerializer(notification).data
        })
