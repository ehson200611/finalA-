# home_page/management/commands/seed_courses.py
import os
import json
from django.core.management.base import BaseCommand
from home_page.models import Course
from django.conf import settings

class Command(BaseCommand):
    help = "Seed Course items from JSON file"

    def handle(self, *args, **kwargs):
        # Пайдо кардани роҳи пурраи файли JSON
        json_path = os.path.join(settings.BASE_DIR, "home_page/seed/courses.json")
        
        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"JSON file not found: {json_path}"))
            return

        # Хондани файл бо UTF-8-SIG барои пешгирии BOM
        try:
            with open(json_path, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"Error decoding JSON: {e}"))
            return

        # Хориҷ кардани ҳамаи Course-ҳои қаблӣ
        Course.objects.all().delete()

        # Эҷоди объекти нав
        created_count = 0
        for item in data:
            try:
                Course.objects.create(
                    order=int(item.get("id", created_count + 1)),
                    image=item.get("image", ""),
                    title_ru=item["title"].get("ru", ""),
                    title_en=item["title"].get("en", ""),
                    title_tj=item["title"].get("tj", ""),
                    description_ru=item["description"].get("ru", ""),
                    description_en=item["description"].get("en", ""),
                    description_tj=item["description"].get("tj", "")
                )
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating item: {item}. Exception: {e}"))

        self.stdout.write(self.style.SUCCESS(f"{created_count} Course items seeded successfully!"))
