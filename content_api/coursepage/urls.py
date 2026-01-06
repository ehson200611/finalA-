from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnglishCourseViewSet, RussianCourseViewSet, PreSchoolCourseViewSet

router = DefaultRouter()
router.register(r'english', EnglishCourseViewSet, basename='englishcourse')
router.register(r'russian', RussianCourseViewSet, basename='russiancourse')
router.register(r'preschool', PreSchoolCourseViewSet, basename='preschoolcourse')

urlpatterns = [
    path('', include(router.urls)),
]
