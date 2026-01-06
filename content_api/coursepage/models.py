from django.db import models

class BaseCourse(models.Model):
    title_ru = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, blank=True)
    title_tj = models.CharField(max_length=255, blank=True)
    
    description_ru = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    description_tj = models.TextField(blank=True)

    duration_ru = models.CharField(max_length=255, blank=True)
    duration_en = models.CharField(max_length=255, blank=True)
    duration_tj = models.CharField(max_length=255, blank=True)

    academic_support_ru = models.CharField(max_length=255, blank=True)
    academic_support_en = models.CharField(max_length=255, blank=True)
    academic_support_tj = models.CharField(max_length=255, blank=True)

    clubs_ru = models.CharField(max_length=255, blank=True)
    clubs_en = models.CharField(max_length=255, blank=True)
    clubs_tj = models.CharField(max_length=255, blank=True)

    level_ru = models.CharField(max_length=255, blank=True)
    level_en = models.CharField(max_length=255, blank=True)
    level_tj = models.CharField(max_length=255, blank=True)

    type_ru = models.CharField(max_length=255, blank=True)
    type_en = models.CharField(max_length=255, blank=True)
    type_tj = models.CharField(max_length=255, blank=True)

    price = models.CharField(max_length=50, blank=True)

    external_id = models.CharField(max_length=50, blank=True, null=True, unique=True)

    class Meta:
        abstract = True

class EnglishCourse(BaseCourse):
    subject_ru = models.TextField(blank=True)
    subject_en = models.TextField(blank=True)
    subject_tj = models.TextField(blank=True)

class RussianCourse(BaseCourse):
    subject_ru = models.TextField(blank=True)
    subject_en = models.TextField(blank=True)
    subject_tj = models.TextField(blank=True)

class PreSchoolCourse(BaseCourse):
    subject_ru = models.TextField(blank=True)
    subject_en = models.TextField(blank=True)
    subject_tj = models.TextField(blank=True)
