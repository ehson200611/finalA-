# authenticator/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .simple_views import (
    ForgotPasswordView,
    RegisterView, 
    LoginView,
    AdminUserViewSet, 
    NotificationViewSet,
    ResetPasswordView,
    SendCodeView,
    UserProfileViewSet, 
    SuperAdminListAPIView,
    AdminListAPIView,
    RegularUsersListAPIView,
    TestAdminViewSet, 
    CurrentUserProfileView,
    CurrentUserNotificationsView,
) 

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='adminuser')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'tests-admin', TestAdminViewSet, basename='testadmin')

urlpatterns = [
    # Аутентификация
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Текущий пользователь
    path('me/profile/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('me/notifications/', CurrentUserNotificationsView.as_view(), name='current-user-notifications'),
    
    # Отдельные функции для получения пользователей (как API View)
    path('superadmins/', SuperAdminListAPIView.as_view(), name='superadmin-list'),
    path('admins/', AdminListAPIView.as_view(), name='admin-list'),
    path('regular-users/', RegularUsersListAPIView.as_view(), name='regular-users-list'),
    path('auth/forgot-password/', ForgotPasswordView.as_view()),
    path('auth/reset-password/', ResetPasswordView.as_view()),
    path('auth/send-code/', SendCodeView.as_view(), name='send-code'),
    
    # API endpoints
    path('', include(router.urls)),
]