# serializers.py
from rest_framework import serializers
from .models import VacancyUser, VacancyQuestion, VacancyWork

class VacancyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacancyUser
        fields = "__all__"

class VacancyQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacancyQuestion
        fields = "__all__"

class VacancyWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacancyWork
        fields = "__all__"