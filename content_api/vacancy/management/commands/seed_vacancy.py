import json
from django.core.management.base import BaseCommand
from vacancy.models import VacancyUser

class Command(BaseCommand):
    help = "Seed VacancyUser data"

    def handle(self, *args, **kwargs):
        with open("vacancy/seed/vacancy_seed.json", "r", encoding="utf-8") as f:
            data = json.load(f)

        items = data.get("vacancyUser", [])

        for item in items:
            VacancyUser.objects.create(
                name_en=item["name_en"],
                name_ru=item["name_ru"],
                name_tj=item["name_tj"],

                title_en=item["title_en"],
                title_ru=item["title_ru"],
                title_tj=item["title_tj"],

                description_en=item["description_en"],
                description_ru=item["description_ru"],
                description_tj=item["description_tj"],

                # image string is ignored, image upload must be manual
            )

        self.stdout.write(self.style.SUCCESS("VacancyUser seeded successfully."))
