from django.urls import path
from .views import TestPageView

urlpatterns = [
    path("test-page/", TestPageView.as_view(), name="test-page"),
]
