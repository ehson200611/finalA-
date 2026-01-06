# authenticator/views.py
from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import AdminUser, NotificationAdmin, UserProfile
from .serializers import (
    RegisterSerializer, LoginSerializer, NotificationSerializer, 
    UserProfileSerializer, UserProfilePDFSerializer, AdminUserListSerializer, AdminUserDetailSerializer,
    AdminUserUpdateRoleSerializer, TestAdminSerializer, AdminRoleSerializer
)
from .permissions import IsSuperAdmin, IsAdminOrSuperAdmin, IsOwnerOrAdmin
from rest_framework.views import APIView
from tests.models import TestResult
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

User = get_user_model()

# --- REGISTER ---
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# --- LOGIN ---
@extend_schema(
    tags=['Authentication'],
    summary='Login to get JWT token',
    description='Authenticate user and return JWT tokens',
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            response={
                'type': 'object',
                'properties': {
                    'refresh': {'type': 'string'},
                    'access': {'type': 'string'},
                    'user': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'name': {'type': 'string'},
                            'phoneNumber': {'type': 'string'},
                            'role': {'type': 'string'},
                            'is_active': {'type': 'boolean'}
                        }
                    }
                }
            },
            description='Login successful'
        )
    }
)
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phoneNumber']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(phoneNumber=phone_number)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=400)

        if not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=400)

        if not user.is_active:
            return Response({"error": "Account is deactivated"}, status=400)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "name": user.name,
                "phoneNumber": user.phoneNumber,
                "role": user.role,
                "is_active": user.is_active
            }
        }, status=200)

# authenticator/views.py

# ... дарозии код ...

# --- ADMIN ROLE MANAGEMENT ---
@extend_schema_view(
    list=extend_schema(
        summary='List all admins',
        description='Get list of all admins (superadmin only)',
        responses={
            200: OpenApiResponse(
                response=AdminRoleSerializer(many=True),
                description='List of admins'
            )
        }
    ),
    retrieve=extend_schema(
        summary='Retrieve admin details',
        description='Get detailed information about specific admin',
        responses={
            200: OpenApiResponse(
                response=AdminRoleSerializer,
                description='Admin details'
            )
        }
    ),
    create=extend_schema(
        summary='Create new admin',
        description='Create new admin user (superadmin only)',
        responses={
            201: OpenApiResponse(
                response=AdminRoleSerializer,
                description='Admin created'
            )
        }
    ),
    update=extend_schema(
        summary='Update admin',
        description='Update admin information',
        responses={
            200: OpenApiResponse(
                response=AdminRoleSerializer,
                description='Admin updated'
            )
        }
    ),
    partial_update=extend_schema(
        summary='Partial update admin',
        description='Partially update admin information',
        responses={
            200: OpenApiResponse(
                response=AdminRoleSerializer,
                description='Admin updated'
            )
        }
    ),
    destroy=extend_schema(
        summary='Delete admin',
        description='Delete admin user (superadmin only)',
        responses={
            204: OpenApiResponse(description='Admin deleted')
        }
    ),
)
# authenticator/simple_views.py
# Дар охири файл илова кунед:

# --- ADMIN ROLE MANAGEMENT ---
class AdminRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admin roles (admin and superadmin users only).
    Only accessible by superadmins.
    """
    serializer_class = AdminRoleSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        """Return only admin and superadmin users"""
        return AdminUser.objects.filter(
            role__in=['admin', 'superadmin']
        ).order_by('-date_joined')
    
    def create(self, request, *args, **kwargs):
        """Create new admin with password handling"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check for required fields
        if 'name' not in request.data or 'phoneNumber' not in request.data:
            return Response(
                {"error": "Name and phoneNumber are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if phone number exists
        phone_number = request.data.get('phoneNumber')
        if AdminUser.objects.filter(phoneNumber=phone_number).exists():
            return Response(
                {"error": "Phone number already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        password = request.data.get('password', 'default123')
        role = request.data.get('role', 'admin')
        
        user = AdminUser.objects.create_user(
            phoneNumber=phone_number,
            name=request.data.get('name'),
            role=role,
            password=password,
            is_staff=(role == 'superadmin'),
            is_superuser=(role == 'superadmin')
        )
        
        return Response(
            AdminRoleSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update admin user"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Prevent self-modification
        if instance.id == request.user.id:
            return Response(
                {"error": "Cannot modify your own account through this endpoint"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Check phone number uniqueness
        phone_number = request.data.get('phoneNumber')
        if phone_number and phone_number != instance.phoneNumber:
            if AdminUser.objects.filter(phoneNumber=phone_number).exclude(id=instance.id).exists():
                return Response(
                    {"error": "Phone number already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update password if provided
        password = request.data.get('password')
        if password:
            instance.set_password(password)
        
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete admin user"""
        instance = self.get_object()
        
        # Prevent self-deletion
        if instance.id == request.user.id:
            return Response(
                {"error": "Cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prevent deleting last superadmin
        if instance.role == 'superadmin':
            superadmin_count = AdminUser.objects.filter(role='superadmin').count()
            if superadmin_count <= 1:
                return Response(
                    {"error": "Cannot delete the last superadmin"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate_admin(self, request, pk=None):
        """Activate admin account"""
        admin = self.get_object()
        admin.is_active = True
        admin.save()
        
        return Response({
            "message": "Admin activated successfully",
            "admin": AdminRoleSerializer(admin).data
        })
    
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate_admin(self, request, pk=None):
        """Deactivate admin account"""
        admin = self.get_object()
        
        if admin.id == request.user.id:
            return Response(
                {"error": "Cannot deactivate your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        admin.is_active = False
        admin.save()
        
        return Response({
            "message": "Admin deactivated successfully",
            "admin": AdminRoleSerializer(admin).data
        })

# --- SIMPLE ADMIN STATISTICS VIEW ---
class AdminStatisticsView(APIView):
    """Simple admin statistics view"""
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        total_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin']
        ).count()
        
        superadmins = AdminUser.objects.filter(role='superadmin').count()
        admins = AdminUser.objects.filter(role='admin').count()
        
        active_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin'],
            is_active=True
        ).count()
        
        inactive_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin'],
            is_active=False
        ).count()
        
        return Response({
            "total_admins": total_admins,
            "superadmins": superadmins,
            "admins": admins,
            "active_admins": active_admins,
            "inactive_admins": inactive_admins
        })

# --- ADMIN USER MANAGEMENT ---
@extend_schema_view(
    list=extend_schema(
        summary='List all admin users',
        description='Get list of all admin users',
        parameters=[
            OpenApiParameter(name='role', description='Filter by role', required=False, type=str),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminUserListSerializer(many=True),
                description='List of admin users'
            )
        }
    ),
    retrieve=extend_schema(
        summary='Retrieve admin user',
        description='Get detailed information about specific admin user',
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='Admin user details'
            )
        }
    ),
    create=extend_schema(
        summary='Create admin user',
        description='Create new admin user',
        responses={
            201: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='Admin user created'
            )
        }
    ),
    update=extend_schema(
        summary='Update admin user',
        description='Update admin user information',
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='Admin user updated'
            )
        }
    ),
    partial_update=extend_schema(
        summary='Partial update admin user',
        description='Partially update admin user information',
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='Admin user updated'
            )
        }
    ),
    destroy=extend_schema(
        summary='Delete admin user',
        description='Delete admin user',
        responses={
            204: OpenApiResponse(description='Admin user deleted')
        }
    ),
)
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
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminUserListSerializer
        elif self.action == 'update_role':
            return AdminUserUpdateRoleSerializer
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

    @extend_schema(
        summary='Update user role',
        description='Update role of a user (only for superadmins)',
        request=AdminUserUpdateRoleSerializer,
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='Role updated successfully'
            )
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-role')
    def update_role(self, request, pk=None):
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

    @extend_schema(
        summary='Activate user',
        description='Activate a user account',
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='User activated successfully'
            )
        }
    )
    @action(detail=True, methods=['post'], url_path='activate')
    def activate_user(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()

        return Response({
            "message": "User activated successfully",
            "user": AdminUserDetailSerializer(user).data
        })

    @extend_schema(
        summary='Deactivate user',
        description='Deactivate a user account',
        responses={
            200: OpenApiResponse(
                response=AdminUserDetailSerializer,
                description='User deactivated successfully'
            )
        }
    )
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate_user(self, request, pk=None):
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

# --- SIMPLE ADMIN LIST VIEW ---
@extend_schema(
    summary='List admins',
    description='Get simple list of all admins',
    responses={
        200: OpenApiResponse(
            response=AdminRoleSerializer(many=True),
            description='List of admins'
        ),
        403: OpenApiResponse(description='Access denied')
    }
)
class AdminListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role == 'superadmin' or user.is_superuser:
            admins = AdminUser.objects.filter(
                role__in=['admin', 'superadmin']
            ).order_by('-date_joined')
        elif user.role == 'admin':
            admins = AdminUser.objects.filter(
                role='admin'
            ).order_by('-date_joined')
        else:
            return Response(
                {"error": "Access denied. Admin role required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AdminRoleSerializer(admins, many=True)
        return Response(serializer.data)

# --- CURRENT ADMIN PROFILE ---
@extend_schema(
    summary='Get current admin profile',
    description='Get profile information of current admin',
    responses={
        200: OpenApiResponse(
            response=AdminRoleSerializer,
            description='Admin profile'
        )
    }
)
class CurrentAdminProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = AdminRoleSerializer
    
    def get_object(self):
        return self.request.user

# --- ADMIN STATISTICS ---
@extend_schema(
    summary='Get admin statistics',
    description='Get statistics about admins',
    responses={
        200: OpenApiResponse(
            response={
                'type': 'object',
                'properties': {
                    'total_admins': {'type': 'integer'},
                    'superadmins': {'type': 'integer'},
                    'admins': {'type': 'integer'},
                    'active_admins': {'type': 'integer'},
                    'inactive_admins': {'type': 'integer'},
                    'stats': {
                        'type': 'object',
                        'properties': {
                            'superadmin_percentage': {'type': 'number'},
                            'admin_percentage': {'type': 'number'},
                            'active_percentage': {'type': 'number'}
                        }
                    }
                }
            },
            description='Admin statistics'
        )
    }
)
class AdminStatisticsView(APIView):
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        total_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin']
        ).count()
        
        superadmins = AdminUser.objects.filter(role='superadmin').count()
        admins = AdminUser.objects.filter(role='admin').count()
        
        active_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin'],
            is_active=True
        ).count()
        
        inactive_admins = AdminUser.objects.filter(
            role__in=['admin', 'superadmin'],
            is_active=False
        ).count()
        
        return Response({
            "total_admins": total_admins,
            "superadmins": superadmins,
            "admins": admins,
            "active_admins": active_admins,
            "inactive_admins": inactive_admins,
            "stats": {
                "superadmin_percentage": (superadmins / total_admins * 100) if total_admins > 0 else 0,
                "admin_percentage": (admins / total_admins * 100) if total_admins > 0 else 0,
                "active_percentage": (active_admins / total_admins * 100) if total_admins > 0 else 0,
            }
        })

# --- USER PROFILE ---
@extend_schema_view(
    list=extend_schema(
        summary='List all user profiles',
        description='Get list of all user profiles',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer(many=True),
                description='List of user profiles'
            )
        }
    ),
    retrieve=extend_schema(
        summary='Retrieve user profile',
        description='Get detailed information about specific user profile',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='User profile details'
            )
        }
    ),
    create=extend_schema(
        summary='Create user profile',
        description='Create new user profile',
        responses={
            201: OpenApiResponse(
                response=UserProfileSerializer,
                description='User profile created'
            )
        }
    ),
    update=extend_schema(
        summary='Update user profile',
        description='Update user profile information',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='User profile updated'
            )
        }
    ),
    partial_update=extend_schema(
        summary='Partial update user profile',
        description='Partially update user profile information',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='User profile updated'
            )
        }
    ),
    destroy=extend_schema(
        summary='Delete user profile',
        description='Delete user profile',
        responses={
            204: OpenApiResponse(description='User profile deleted')
        }
    ),
)
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

    @extend_schema(
        summary='Update user profile status',
        description='Update status of a user profile',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'enum': ['active', 'inactive', 'pending']}
                }
            }
        },
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='Status updated successfully'
            ),
            400: OpenApiResponse(description='Invalid status value')
        }
    )
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

    @extend_schema(
        summary='Update PDF status',
        description='Update PDF status (true/false)',
        request=UserProfilePDFSerializer,
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='PDF status updated successfully'
            ),
            400: OpenApiResponse(description='Bad Request')
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-pdf-status')
    def update_pdf_status(self, request, pk=None):
        """Обновление статуса PDF (только true/false)"""
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

    @extend_schema(
        summary='List PDF profiles',
        description='Get list of profiles with PDF enabled',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer(many=True),
                description='List of PDF profiles'
            )
        }
    )
    @action(detail=False, methods=['get'], url_path='pdf-profiles')
    def pdf_profiles(self, request):
        """Список профилей с is_pdf=True"""
        queryset = self.get_queryset().filter(is_pdf=True)
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='List non-PDF profiles',
        description='Get list of profiles with PDF disabled',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer(many=True),
                description='List of non-PDF profiles'
            )
        }
    )
    @action(detail=False, methods=['get'], url_path='non-pdf-profiles')
    def non_pdf_profiles(self, request):
        """Список профилей с is_pdf=False"""
        queryset = self.get_queryset().filter(is_pdf=False)
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='Toggle PDF status',
        description='Toggle PDF status (switch between true/false)',
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='PDF status toggled successfully'
            )
        }
    )
    @action(detail=True, methods=['post'], url_path='toggle-pdf')
    def toggle_pdf(self, request, pk=None):
        """Переключение статуса PDF"""
        profile = self.get_object()
        
        profile.is_pdf = not profile.is_pdf
        profile.pdf_updated_at = timezone.now()
        profile.save()
        
        return Response({
            "message": f"PDF status toggled to {profile.is_pdf}",
            "profile": UserProfileSerializer(profile).data
        })

# --- CURRENT USER PROFILE ---
@extend_schema(
    tags=['User Profile'],
    summary='Get current user profile',
    description='Get profile information of current user',
    responses={
        200: OpenApiResponse(
            response=UserProfileSerializer,
            description='User profile'
        ),
        201: OpenApiResponse(
            response=UserProfileSerializer,
            description='User profile created'
        )
    }
)
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        try:
            return UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            # Создаем профиль, если не существует
            profile = UserProfile.objects.create(
                user=self.request.user,
                phone=self.request.user.phoneNumber,
                status='active',
                is_pdf=False
            )
            return profile
    
    @extend_schema(
        summary='Update PDF status for current user',
        description='Update PDF status (is_pdf field) for current user',
        request=UserProfilePDFSerializer,
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description='PDF status updated'
            )
        }
    )
    def patch(self, request, *args, **kwargs):
        """Обновление только поля is_pdf текущего пользователя"""
        profile = self.get_object()
        
        serializer = UserProfilePDFSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            profile_serializer = UserProfileSerializer(profile)
            return Response(profile_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- CURRENT USER PDF STATUS ---
@extend_schema(
    tags=['User Profile'],
    summary='Get current user PDF status',
    description='Get PDF status (is_pdf) for current user',
    responses={
        200: OpenApiResponse(
            response={
                'type': 'object',
                'properties': {
                    'is_pdf': {'type': 'boolean'},
                    'pdf_updated_at': {'type': 'string', 'format': 'date-time', 'nullable': True}
                }
            },
            description='PDF status'
        )
    }
)
class CurrentUserPDFStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Получить статус PDF текущего пользователя"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            return Response({
                'is_pdf': profile.is_pdf,
                'pdf_updated_at': profile.pdf_updated_at
            })
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

# --- NOTIFICATIONS ---
@extend_schema_view(
    list=extend_schema(
        summary='List all notifications',
        description='Get list of all notifications',
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer(many=True),
                description='List of notifications'
            )
        }
    ),
    retrieve=extend_schema(
        summary='Retrieve notification',
        description='Get detailed information about specific notification',
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer,
                description='Notification details'
            )
        }
    ),
    create=extend_schema(
        summary='Create notification',
        description='Create new notification',
        responses={
            201: OpenApiResponse(
                response=NotificationSerializer,
                description='Notification created'
            )
        }
    ),
    update=extend_schema(
        summary='Update notification',
        description='Update notification information',
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer,
                description='Notification updated'
            )
        }
    ),
    partial_update=extend_schema(
        summary='Partial update notification',
        description='Partially update notification information',
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer,
                description='Notification updated'
            )
        }
    ),
    destroy=extend_schema(
        summary='Delete notification',
        description='Delete notification',
        responses={
            204: OpenApiResponse(description='Notification deleted')
        }
    ),
)
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = NotificationAdmin.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action == 'create':
            permission_classes = [IsAdminOrSuperAdmin]
        else:
            permission_classes = [IsAdminOrSuperAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return NotificationAdmin.objects.none()
        
        if user.role in ['superadmin', 'admin'] or user.is_superuser:
            return NotificationAdmin.objects.all().order_by("-date")
        
        return NotificationAdmin.objects.filter(user=user).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- SUPER ADMIN LIST ---
@extend_schema(
    summary='List all superadmins',
    description='Get list of all superadmin users',
    responses={
        200: OpenApiResponse(
            response={
                'type': 'object',
                'properties': {
                    'count': {'type': 'integer'},
                    'superadmins': AdminUserListSerializer(many=True)
                }
            },
            description='List of superadmins'
        )
    }
)
class SuperAdminListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        superadmins = AdminUser.objects.filter(role="superadmin")
        serializer = AdminUserListSerializer(superadmins, many=True)

        return Response({
            "count": superadmins.count(),
            "superadmins": serializer.data
        })

# --- TEST ADMIN ---
@extend_schema_view(
    list=extend_schema(
        summary='List all test results',
        description='Get list of all test results',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'testAdmin': TestAdminSerializer(many=True)
                    }
                },
                description='List of test results'
            )
        }
    ),
    retrieve=extend_schema(
        summary='Retrieve test result',
        description='Get detailed information about specific test result',
        responses={
            200: OpenApiResponse(
                response=TestAdminSerializer,
                description='Test result details'
            )
        }
    )
)
class TestAdminViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TestAdminSerializer
    queryset = TestResult.objects.all().order_by("-dateCompleted")
    
    def get_permissions(self):
        if self.action == 'list':
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

# --- CURRENT USER NOTIFICATIONS ---
@extend_schema(
    summary='Get current user notifications',
    description='Get list of notifications for current user',
    responses={
        200: OpenApiResponse(
            response=NotificationSerializer(many=True),
            description='List of notifications'
        )
    }
)
class CurrentUserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationAdmin.objects.filter(user=self.request.user).order_by("-date")