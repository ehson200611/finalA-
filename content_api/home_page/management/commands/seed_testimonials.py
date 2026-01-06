from django.core.management.base import BaseCommand
from home_page.models import Testimonial

class Command(BaseCommand):
    help = "Seed initial testimonials"

    def handle(self, *args, **kwargs):
        testimonials_data = [
            {
                "name": {"ru": "Алишер Насимов", "en": "Alisher Nasimov", "tj": "Алишер Насимов"},
                "age": "25",
                "review": {
                    "ru": "Отличный учебный центр! Преподаватели очень профессиональные и внимательные. За 6 месяцев мой английский улучшился с начального до среднего уровня.",
                    "en": "Excellent educational center! Teachers are very professional and attentive. In 6 months my English improved from beginner to intermediate level.",
                    "tj": "Маркази таҳсилии аъло! Омӯзгорон хеле касбӣ ва диққатманд ҳастанд. Дар 6 моҳ забони англисии ман аз сатҳи оғозӣ то миёнаравӣ беҳтар шуд."
                },
                "image": ""
            },
            {
                "name": {"ru": "Мария Иванова", "en": "Maria Ivanova", "tj": "Мария Иванова"},
                "age": "22",
                "review": {
                    "ru": "Очень довольна обучением. Атмосфера дружелюбная, материалы современные. Особенно понравились разговорные клубы с носителями языка.",
                    "en": "Very satisfied with the training. The atmosphere is friendly, the materials are modern. I especially liked the speaking clubs with native speakers.",
                    "tj": "Аз таҳсил хеле хурсандям. Фазо дӯстона, маводҳо муосир. Бештар аз ҳама клубҳои суҳбат бо забони модарӣ маъқул шуд."
                },
                "image": ""
            }
        ]

        for index, data in enumerate(testimonials_data, start=1):
            Testimonial.objects.update_or_create(
                order=index,
                defaults={
                    "name_ru": data["name"]["ru"],
                    "name_en": data["name"]["en"],
                    "name_tj": data["name"]["tj"],
                    "age": data.get("age", ""),
                    "review_ru": data["review"]["ru"],
                    "review_en": data["review"]["en"],
                    "review_tj": data["review"]["tj"],
                    "image": data.get("image", "")
                }
            )
        self.stdout.write(self.style.SUCCESS("Testimonials seeded successfully."))
