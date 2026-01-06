from rest_framework import viewsets
from .models import EnglishCourse, RussianCourse, PreSchoolCourse
from .serializers import EnglishCourseSerializer, RussianCourseSerializer, PreSchoolCourseSerializer

class EnglishCourseViewSet(viewsets.ModelViewSet):
    queryset = EnglishCourse.objects.all()
    serializer_class = EnglishCourseSerializer

class RussianCourseViewSet(viewsets.ModelViewSet):
    queryset = RussianCourse.objects.all()
    serializer_class = RussianCourseSerializer

class PreSchoolCourseViewSet(viewsets.ModelViewSet):
    queryset = PreSchoolCourse.objects.all()
    serializer_class = PreSchoolCourseSerializer
