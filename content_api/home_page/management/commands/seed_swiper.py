# home_page/management/commands/seed_swiper.py
import os
import json
from django.core.management.base import BaseCommand
from home_page.models import SwiperItem
from django.conf import settings

class Command(BaseCommand):
    help = "Seed Swiper items from JSON file"

    def handle(self, *args, **kwargs):
        # Пайдо кардани роҳи пурраи файли JSON
        json_path = os.path.join(settings.BASE_DIR, "home_page/seed/swipper.json")
        
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

        # Хориҷ кардани ҳамаи SwiperItem-ҳои қаблӣ
        SwiperItem.objects.all().delete()

        # Эҷоди объекти нав
        created_count = 0
        for item in data:
            try:
                SwiperItem.objects.create(
                    name=item["name"],
                    title=item["title"],
                    href=item.get("href", ""),
                    image=item.get("image", "")
                )
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating item: {item}. Exception: {e}"))

        self.stdout.write(self.style.SUCCESS(f"{created_count} Swiper items seeded successfully!"))
