from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    pdf = models.FileField(upload_to="books/")  # все файлы будут храниться в MEDIA_ROOT/books/

    def __str__(self):
        return self.title
