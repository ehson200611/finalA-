from django.db import models


# --- SWIPER ---
from django.db import models

class SwiperItem(models.Model):
    order = models.PositiveIntegerField(default=0)
    href = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='swiper/', null=True, blank=True)
    
    # Title fields for each language
    title_ru = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    title_tj = models.CharField(max_length=255)
    
    # Optional: Name fields if needed
    name_ru = models.CharField(max_length=255, blank=True)
    name_en = models.CharField(max_length=255, blank=True)
    name_tj = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        if self.order == 0:
            last_order = SwiperItem.objects.aggregate(models.Max('order'))['order__max'] or 0
            self.order = last_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_en




# --- FEATURE ---
class Feature(models.Model):
    order = models.PositiveIntegerField(default=0)
    name_ru = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    name_tj = models.CharField(max_length=255)
    description_ru = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    description_tj = models.TextField(blank=True)
    image = models.ImageField(upload_to="features/", blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name_en


# --- WHY US ---
class WhyUsItem(models.Model):
    order = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=100, blank=True)
    text_ru = models.TextField()
    text_en = models.TextField()
    text_tj = models.TextField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"WhyUs #{self.pk}"


# --- STATISTICS ---
class Stat(models.Model):
    id = models.AutoField(primary_key=True)
    number = models.CharField(max_length=50)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.number


# --- PARTNER ---
class Partner(models.Model):
    order = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="partners/", blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Partner #{self.pk}"


# --- TESTIMONIAL ---
from django.db import models

class Testimonial(models.Model):
    order = models.PositiveIntegerField(default=0)
    
    # Name
    name_ru = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    name_tj = models.CharField(max_length=255)
    
    # Age
    age = models.CharField(max_length=10, blank=True)
    
    # Review
    review_ru = models.TextField(blank=True)
    review_en = models.TextField(blank=True)
    review_tj = models.TextField(blank=True)
    
    # Image
    image = models.ImageField(upload_to="testimonials/", blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name_en






# --- GALLERY ---
class GalleryItem(models.Model):
    order = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="gallery/", blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Gallery #{self.pk}"


# --- COURSE ---
class Course(models.Model):
    order = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="courses/", blank=True, null=True)
    title_ru = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    title_tj = models.CharField(max_length=255)
    description_ru = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    description_tj = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title_en


# --- INFO SWIPER ---
class InfoSwiperItem(models.Model):
    order = models.PositiveIntegerField(default=0)
    title_ru = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    title_tj = models.CharField(max_length=255)
    description_ru = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    description_tj = models.TextField(blank=True)
    background_image = models.ImageField(upload_to="info_swiper/", blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title_en
