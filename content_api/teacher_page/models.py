from django.db import models

class Teacher(models.Model):
    name_ru = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    name_tj = models.CharField(max_length=100)
    experience = models.PositiveIntegerField()

    image = models.ImageField(upload_to="teachers/images/", blank=True, null=True)
    video = models.FileField(upload_to="teachers/videos/", blank=True, null=True)

    description_ru = models.TextField()
    description_en = models.TextField()
    description_tj = models.TextField()

    def __str__(self):
        return self.name_en


class TeachersPage(models.Model):
    english_language_ru = models.CharField(max_length=255)
    english_language_en = models.CharField(max_length=255)
    english_language_tj = models.CharField(max_length=255)

    online_ru = models.TextField()
    online_en = models.TextField()
    online_tj = models.TextField()

    from_990_ru = models.CharField(max_length=50)
    from_990_en = models.CharField(max_length=50)
    from_990_tj = models.CharField(max_length=50)

    we_monitor_ru = models.TextField()
    we_monitor_en = models.TextField()
    we_monitor_tj = models.TextField()

    change_goals_ru = models.TextField()
    change_goals_en = models.TextField()
    change_goals_tj = models.TextField()

    select_tutor_ru = models.CharField(max_length=100)
    select_tutor_en = models.CharField(max_length=100)
    select_tutor_tj = models.CharField(max_length=100)

    teachers = models.ManyToManyField(Teacher, related_name="pages")

    def __str__(self):
        return "Teachers Page"
