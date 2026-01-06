from rest_framework import serializers
from .models import TestPage

class TestPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPage
        fields = ['id', 'data']
