# urls.py (намуна)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vacancy-users', views.VacancyUserViewSet)
router.register(r'vacancy-questions', views.VacancyQuestionViewSet)
router.register(r'vacancy-works', views.VacancyWorkViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]