from django.urls import path, include
from rest_framework.routers import DefaultRouter
from faq.views import FaqTextViewSet, FaqPageViewSet

router = DefaultRouter()
router.register(r'faq-text', FaqTextViewSet, basename='faqtext')
router.register(r'faq-page', FaqPageViewSet, basename='faqpage')

urlpatterns = [
    path('', include(router.urls)),
]
    