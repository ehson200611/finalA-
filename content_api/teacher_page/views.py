# views.py
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Teacher, TeachersPage
from .serializers import TeacherSerializer, TeachersPageSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    parser_classes = (MultiPartParser, FormParser)  # барои form-data ва файл

class TeachersPageViewSet(viewsets.ModelViewSet):
    queryset = TeachersPage.objects.all()
    serializer_class = TeachersPageSerializer
    parser_classes = (MultiPartParser, FormParser)
