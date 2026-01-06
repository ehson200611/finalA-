import os
import json
from django.core.management.base import BaseCommand
from tests.models import Question

class Command(BaseCommand):
    help = "Seed all questions for levels A1–C2"

    def handle(self, *args, **kwargs):
        base_path = os.path.join(os.getcwd(), "tests", "seed_data")
        levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

        for level in levels:
            file_path = os.path.join(base_path, f"questions_{level.lower()}.json")
            if not os.path.exists(file_path):
                self.stdout.write(self.style.WARNING(f"⚠️ File not found for {level}: {file_path}"))
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                questions = json.load(f)
                for q in questions:
                    Question.objects.update_or_create(
                        question=q["question"],
                        defaults={
                            "level": level,
                            "options": q["options"],
                            "correctAnswer": q["correctAnswer"],
                            "explanation": q["explanation"],
                        },
                    )
            self.stdout.write(self.style.SUCCESS(f"✅ {level} questions imported!"))
