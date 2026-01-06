from rest_framework import serializers
from .models import FaqText, FaqPage

class FaqTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqText
        fields = "__all__"

class FaqPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqPage
        fields = "__all__"
