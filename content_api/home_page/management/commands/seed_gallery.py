# home_page/management/commands/seed_gallery.py
import os
import json
from django.core.management.base import BaseCommand
from home_page.models import GalleryItem
from django.conf import settings

class Command(BaseCommand):
    help = "Seed Gallery items from JSON file"

    def handle(self, *args, **kwargs):
        # Пайдо кардани роҳи пурраи файли JSON
        json_path = os.path.join(settings.BASE_DIR, "home_page/seed/gallery.json")
        
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

        # Хориҷ кардани ҳамаи GalleryItem-ҳои қаблӣ
        GalleryItem.objects.all().delete()

        # Эҷоди объекти нав
        created_count = 0
        for item in data:
            try:
                GalleryItem.objects.create(
                    order=int(item.get("id", created_count + 1)),
                    image=item.get("image", "")
                )
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating item: {item}. Exception: {e}"))

        self.stdout.write(self.style.SUCCESS(f"{created_count} Gallery items seeded successfully!"))
