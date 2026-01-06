from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    SwiperItemViewSet, FeatureViewSet, TestimonialViewSet,
    CourseViewSet, GalleryItemViewSet, PartnerViewSet,
    StatViewSet, WhyUsItemViewSet, InfoSwiperItemViewSet
)

router = DefaultRouter()
router.register(r'swiper-items', SwiperItemViewSet)
router.register(r'features', FeatureViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'gallery-items', GalleryItemViewSet)
router.register(r'partners', PartnerViewSet)
router.register(r'stats', StatViewSet)
router.register(r'why-us', WhyUsItemViewSet)
router.register(r'info-swiper', InfoSwiperItemViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
