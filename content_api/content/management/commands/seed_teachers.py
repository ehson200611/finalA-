# teacher_page/management/commands/seed_teachers.py
import json
import os
from django.core.management.base import BaseCommand
from teacher_page.models import Teacher, TeachersPage
from django.core.files import File
from django.conf import settings

class Command(BaseCommand):
    help = "Seed teachers page and teachers"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(os.path.dirname(__file__), "teachers_seed.json")
        
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)

        teachers_data = data["teachersPage"]["teachersData"]

        teacher_objs = []
        for t in teachers_data:
            teacher = Teacher.objects.create(
                name_ru=t["name"]["ru"],
                name_en=t["name"]["en"],
                name_tj=t["name"]["tj"],
                experience=t.get("experience", 0),
                description_ru=t["description"]["ru"],
                description_en=t["description"]["en"],
                description_tj=t["description"]["tj"],
            )

            # Агар imageUrl вуҷуд дошта бошад, истифода мебарем
            image_path = t.get("imageUrl")
            if image_path:
                full_path = os.path.join(settings.BASE_DIR, image_path.strip("/"))
                if os.path.exists(full_path):
                    with open(full_path, "rb") as img_file:
                        teacher.image.save(os.path.basename(full_path), File(img_file), save=True)

            # Агар video вуҷуд дошта бошад, истифода мебарем
            video_url = t.get("video")
            if video_url:
                # Агар ин local file бошад
                if video_url.startswith("/"):
                    full_video_path = os.path.join(settings.BASE_DIR, video_url.strip("/"))
                    if os.path.exists(full_video_path):
                        with open(full_video_path, "rb") as vid_file:
                            teacher.video.save(os.path.basename(full_video_path), File(vid_file), save=True)
                else:
                    # Агар URL бошад, мо онро ҳамчун string нигоҳ медорем
                    teacher.video = video_url
                    teacher.save()

            teacher_objs.append(teacher)

        # Эҷод кардани TeachersPage
        page_data = data["teachersPage"]
        page = TeachersPage.objects.create(
            english_language_ru=page_data["englishLanguage"]["ru"],
            english_language_en=page_data["englishLanguage"]["en"],
            english_language_tj=page_data["englishLanguage"]["tj"],
            online_ru=page_data["online"]["ru"],
            online_en=page_data["online"]["en"],
            online_tj=page_data["online"]["tj"],
            from_990_ru=page_data["from990"]["ru"],
            from_990_en=page_data["from990"]["en"],
            from_990_tj=page_data["from990"]["tj"],
            we_monitor_ru=page_data["weMonitor"]["ru"],
            we_monitor_en=page_data["weMonitor"]["en"],
            we_monitor_tj=page_data["weMonitor"]["tj"],
            change_goals_ru=page_data["changeGoals"]["ru"],
            change_goals_en=page_data["changeGoals"]["en"],
            change_goals_tj=page_data["changeGoals"]["tj"],
            select_tutor_ru=page_data["selectTutor"]["ru"],
            select_tutor_en=page_data["selectTutor"]["en"],
            select_tutor_tj=page_data["selectTutor"]["tj"],
        )

        page.teachers.set(teacher_objs)
        page.save()

        self.stdout.write(self.style.SUCCESS("Teachers page successfully seeded!"))
