# content_api/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    # ===================== ADMIN =====================
    path("admin/", admin.site.urls),

    # ===================== APPS =====================
    path("admin-app/", include("authenticator.urls")),
    path("faq/", include("faq.urls")),
    path("homepage/", include("home_page.urls")),
    path("teachers/", include("teacher_page.urls")),
    path("tests/", include("tests.urls")),
    path("test-page/", include("test_page.urls")),
    path("vacancy/", include("vacancy.urls")),
    path("coursepage/", include("coursepage.urls")),
    path("contact/", include("contact.urls")),
    path('blogs/', include('blogs.urls')),
    path('feedback/', include('feedback.urls')),
    path('books/', include('bookpage.urls')),

    # ===================== API DOCUMENTATION =====================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(
        url_name='schema',
    ), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ===================== JWT TOKENS =====================
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # ===================== ROOT REDIRECT =====================
    # Измените на /api/swagger/ вместо /swagger/
    path("", RedirectView.as_view(url="/swagger/", permanent=False)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)