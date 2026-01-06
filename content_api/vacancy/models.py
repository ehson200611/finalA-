# models.py
from django.db import models

class VacancyWork(models.Model):
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    email = models.EmailField()
    date_of_birth = models.DateField()
    phonenumber = models.CharField(max_length=20)
    resumefile = models.FileField(upload_to='resumes/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} {self.surname}"

# Моделҳои мавҷуда
class VacancyQuestion(models.Model):
    question_en = models.TextField()
    question_ru = models.TextField()
    question_tj = models.TextField()

    answer_en = models.TextField()
    answer_ru = models.TextField()
    answer_tj = models.TextField()

    def __str__(self):
        return f"Question {self.id}"

class VacancyUser(models.Model):
    name_en = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    name_tj = models.CharField(max_length=255)

    title_en = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255)
    title_tj = models.CharField(max_length=255)

    description_en = models.TextField()
    description_ru = models.TextField()
    description_tj = models.TextField()

    image = models.ImageField(upload_to='vacancy/', blank=True, null=True)

    def __str__(self):
        return self.name_en