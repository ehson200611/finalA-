from django.db import models
from authenticator.models import UserProfile

LEVEL_CHOICES = [
    ('A1', 'A1'),
    ('A2', 'A2'),
    ('B1', 'B1'),
    ('B2', 'B2'),
    ('C1', 'C1'),
    ('C2', 'C2'),
]

class Question(models.Model):
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    question = models.TextField()
    options = models.JSONField()
    correctAnswer = models.IntegerField()
    explanation = models.TextField()

    def __str__(self):
        return f"{self.level}: {self.question[:60]}"


from django.db import models

class TestResult(models.Model):
    profile = models.ForeignKey("authenticator.UserProfile", on_delete=models.CASCADE)
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    totalQuestions = models.IntegerField()
    correctAnswers = models.IntegerField()
    incorrectAnswers = models.IntegerField()
    score = models.IntegerField()
    dateCompleted = models.DateTimeField(auto_now_add=True)

    # ✅ Нав: ҷавобҳои корбар
    answers = models.JSONField(default=dict, blank=True)  # {question_id: selected_index}

    def __str__(self):
        return f"{self.profile.user.name} - {self.level} - {self.score}"



