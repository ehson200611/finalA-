from django.db import models

class Step(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    ru = models.TextField(blank=True)
    en = models.TextField(blank=True)
    tj = models.TextField(blank=True)

    def to_dict(self):
        return {"id": self.id, "text": {"ru": self.ru, "en": self.en, "tj": self.tj}}

class TestPage(models.Model):
    heroTitle_ru = models.CharField(max_length=255)
    heroTitle_en = models.CharField(max_length=255)
    heroTitle_tj = models.CharField(max_length=255)

    heroSubtitle_ru = models.CharField(max_length=255)
    heroSubtitle_en = models.CharField(max_length=255)
    heroSubtitle_tj = models.CharField(max_length=255)

    heroDescription_ru = models.CharField(max_length=255)
    heroDescription_en = models.CharField(max_length=255)
    heroDescription_tj = models.CharField(max_length=255)

    howItWorksTitle_ru = models.CharField(max_length=255)
    howItWorksTitle_en = models.CharField(max_length=255)
    howItWorksTitle_tj = models.CharField(max_length=255)

    levelsTitle_ru = models.CharField(max_length=255)
    levelsTitle_en = models.CharField(max_length=255)
    levelsTitle_tj = models.CharField(max_length=255)

    levelsDescription_ru = models.TextField()
    levelsDescription_en = models.TextField()
    levelsDescription_tj = models.TextField()

    steps = models.ManyToManyField(Step)

    def to_dict(self):
        return {
            "heroTitle": {
                "ru": self.heroTitle_ru,
                "en": self.heroTitle_en,
                "tj": self.heroTitle_tj,
            },
            "heroSubtitle": {
                "ru": self.heroSubtitle_ru,
                "en": self.heroSubtitle_en,
                "tj": self.heroSubtitle_tj,
            },
            "heroDescription": {
                "ru": self.heroDescription_ru,
                "en": self.heroDescription_en,
                "tj": self.heroDescription_tj,
            },
            "howItWorksTitle": {
                "ru": self.howItWorksTitle_ru,
                "en": self.howItWorksTitle_en,
                "tj": self.howItWorksTitle_tj,
            },
            "levelsTitle": {
                "ru": self.levelsTitle_ru,
                "en": self.levelsTitle_en,
                "tj": self.levelsTitle_tj,
            },
            "levelsDescription": {
                "ru": self.levelsDescription_ru,
                "en": self.levelsDescription_en,
                "tj": self.levelsDescription_tj,
            },
            "steps": [step.to_dict() for step in self.steps.all()],
        }
