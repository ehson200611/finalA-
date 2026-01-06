# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeachersPageViewSet

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
