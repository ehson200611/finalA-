# teacher_page/serializers.py
from rest_framework import serializers
from .models import Teacher, TeachersPage

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = "__all__"


class TeachersPageSerializer(serializers.ModelSerializer):
    teachers = TeacherSerializer(many=True, read_only=True)

    class Meta:
        model = TeachersPage
        fields = "__all__"
