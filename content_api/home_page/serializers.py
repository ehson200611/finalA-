from rest_framework import serializers
from .models import SwiperItem, Feature, Testimonial, Course, GalleryItem, Partner, Stat, WhyUsItem, InfoSwiperItem

from rest_framework import serializers
from .models import SwiperItem

from rest_framework import serializers
from .models import SwiperItem

class SwiperItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwiperItem
        fields = [
            'id', 'order', 'href', 'image',
            'title_ru', 'title_en', 'title_tj',
            'name_ru', 'name_en', 'name_tj'
        ]



class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

from rest_framework import serializers
from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'


class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stat
        fields = ['order', 'number'] 

class WhyUsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyUsItem
        fields = '__all__'

class InfoSwiperItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoSwiperItem
        fields = '__all__'
