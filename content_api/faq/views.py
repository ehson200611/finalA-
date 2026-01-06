from rest_framework import viewsets
from faq.models import FaqText, FaqPage
from faq.serializers import FaqTextSerializer, FaqPageSerializer
from rest_framework import viewsets, permissions

class FaqTextViewSet(viewsets.ModelViewSet):
    queryset = FaqText.objects.all()
    serializer_class = FaqTextSerializer
    permission_classes = [permissions.AllowAny]  # Полностью публичный

class FaqPageViewSet(viewsets.ModelViewSet):
    queryset = FaqPage.objects.all()
    serializer_class = FaqPageSerializer
    permission_classes = [permissions.AllowAny]  # Полностью публичный

    
