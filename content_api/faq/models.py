from django.db import models

class FaqText(models.Model):
    # Main FAQ page text
    title_en = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255)
    title_tj = models.CharField(max_length=255)

    faqDescription_en = models.TextField()
    faqDescription_ru = models.TextField()
    faqDescription_tj = models.TextField()

    addQuestion_en = models.CharField(max_length=255)
    addQuestion_ru = models.CharField(max_length=255)
    addQuestion_tj = models.CharField(max_length=255)

    addTitle_en = models.CharField(max_length=255)
    addTitle_ru = models.CharField(max_length=255)
    addTitle_tj = models.CharField(max_length=255)

    editTitle_en = models.CharField(max_length=255)
    editTitle_ru = models.CharField(max_length=255)
    editTitle_tj = models.CharField(max_length=255)

    cancel_en = models.CharField(max_length=255)
    cancel_ru = models.CharField(max_length=255)
    cancel_tj = models.CharField(max_length=255)

    save_en = models.CharField(max_length=255)
    save_ru = models.CharField(max_length=255)
    save_tj = models.CharField(max_length=255)

    add_en = models.CharField(max_length=255)
    add_ru = models.CharField(max_length=255)
    add_tj = models.CharField(max_length=255)

    confirmDelete_en = models.CharField(max_length=255)
    confirmDelete_ru = models.CharField(max_length=255)
    confirmDelete_tj = models.CharField(max_length=255)

    def __str__(self):
        return self.title_en


class FaqPage(models.Model):
    question_en = models.TextField()
    question_ru = models.TextField()
    question_tj = models.TextField()

    answer_en = models.TextField()
    answer_ru = models.TextField()
    answer_tj = models.TextField()

    def __str__(self):
        return f"FAQ {self.id}"
