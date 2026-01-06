from django.db import models

class Blog(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    media = models.FileField(upload_to='blogs_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
