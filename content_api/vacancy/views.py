# views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from .models import VacancyUser, VacancyQuestion, VacancyWork
from .serializers import VacancyUserSerializer, VacancyQuestionSerializer, VacancyWorkSerializer

class VacancyUserViewSet(ModelViewSet):
    queryset = VacancyUser.objects.all()
    serializer_class = VacancyUserSerializer
    parser_classes = [MultiPartParser, FormParser]

class VacancyQuestionViewSet(ModelViewSet):
    queryset = VacancyQuestion.objects.all()
    serializer_class = VacancyQuestionSerializer

class VacancyWorkViewSet(ModelViewSet):
    queryset = VacancyWork.objects.all()
    serializer_class = VacancyWorkSerializer
    parser_classes = [MultiPartParser, FormParser]  # Барои қабули файл