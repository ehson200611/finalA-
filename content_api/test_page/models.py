from django.db import models

class TestPage(models.Model):
    data = models.JSONField()  # Ин майдони асосӣ барои JSON-и шумо
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TestPage {self.id}"
