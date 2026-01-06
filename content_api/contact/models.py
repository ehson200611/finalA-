# contacts/models.py
from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    iframe = models.TextField(blank=True)  # map embed
    hours = models.CharField(max_length=100)
    external_id = models.CharField(max_length=100, blank=True, null=True)  # барои id-и дуюм

    def __str__(self):
        return self.name
