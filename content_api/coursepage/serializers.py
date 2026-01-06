from rest_framework import serializers
from .models import EnglishCourse, RussianCourse, PreSchoolCourse

class BaseCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # will be set in child
        fields = '__all__'

class EnglishCourseSerializer(BaseCourseSerializer):
    class Meta(BaseCourseSerializer.Meta):
        model = EnglishCourse

class RussianCourseSerializer(BaseCourseSerializer):
    class Meta(BaseCourseSerializer.Meta):
        model = RussianCourse

class PreSchoolCourseSerializer(BaseCourseSerializer):
    class Meta(BaseCourseSerializer.Meta):
        model = PreSchoolCourse
