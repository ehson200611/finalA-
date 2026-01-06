from rest_framework import viewsets
from .models import TestPage
from .serializers import TestPageSerializer

class TestPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestPage.objects.all()
    serializer_class = TestPageSerializer
