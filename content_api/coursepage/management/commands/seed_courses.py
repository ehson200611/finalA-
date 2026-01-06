from django.core.management.base import BaseCommand
from coursepage.models import EnglishCourse, RussianCourse, PreSchoolCourse

class Command(BaseCommand):
    help = "Seed courses page data"

    def handle(self, *args, **kwargs):
        courses_json = {
            "english": [
                {
                    "id": "1",
                    "title": {"ru": "Английский", "en": "English", "tj": "Инглисӣ"},
                    "description": {"ru": "Описание курса", "en": "Description of the Course", "tj": "Тавсифи курс"},
                    "duration": {"ru": "3 занятия в неделю (по 90 минут)", "en": "3 lessons per week (90 minutes each)", "tj": "3 дарс дар як ҳафта (90 дақиқа)"},
                    "academicSupport": {"ru": "1 академическое занятие (30 минут) в неделю", "en": "1 academic support session (30 minutes) per week", "tj": "1 дарси иловагӣ (30 дақиқа) дар як ҳафта"},
                    "clubs": {"ru": "Можно записаться на 1 клубное занятие в неделю", "en": "Students can sign up for 1 club session per week", "tj": "Донишҷӯён метавонанд дар як ҳафта ба 1 клуб ҳамроҳ шаванд"},
                    "level": {"ru": "Let's Go (7–9 лет)", "en": "Level: Let's Go (ages 7–9 y.o.)", "tj": "Сатҳ: Let's Go (аз 7 то 9 сола)"},
                    "type": {"ru": "Групповые / Индивидуальные занятия", "en": "Type of study: Group sessions / Individual sessions", "tj": "Навъи таҳсил: Гурӯҳӣ / Фардӣ"},
                    "price": "120"
                }
            ],
            "russian": [
                {
                    "id": "4",
                    "title": {"ru": "Русский", "en": "Russian", "tj": "Русӣ"},
                    "description": {"ru": "Описание курса", "en": "Description of the Course", "tj": "Тавсифи курс"},
                    "duration": {"ru": "3 занятия в неделю (по 90 минут)", "en": "3 lessons per week (90 minutes each)", "tj": "3 дарс дар як ҳафта (90 дақиқа)"},
                    "academicSupport": {"ru": "1 академическое занятие (30 минут) в неделю", "en": "1 academic support session (30 minutes) per week", "tj": "1 дарси иловагӣ (30 дақиқа) дар як ҳафта"},
                    "clubs": {"ru": "Можно записаться на 1 клубное занятие в неделю", "en": "Students can sign up for 1 club session per week", "tj": "Донишҷӯён метавонанд дар як ҳафта ба 1 клуб ҳамроҳ шаванд"},
                    "level": {"ru": "Russian Basics (8–10 лет)", "en": "Level: Russian Basics (ages 8–10 y.o.)", "tj": "Сатҳ: Russian Basics (аз 8 то 10 сола)"},
                    "type": {"ru": "Групповые / Индивидуальные занятия", "en": "Type of study: Group sessions / Individual sessions", "tj": "Навъи таҳсил: Гурӯҳӣ / Фардӣ"},
                    "price": "от 300"
                }
            ],
            "preSchools": [
                {
                    "id": "1763373298420",
                    "title": {"ru": "ljdknewlbldk", "en": "", "tj": ""},
                    "description": {"ru": "jdbwebk", "en": "", "tj": ""},
                    "duration": {"ru": "dipnwel", "en": "", "tj": ""},
                    "academicSupport": {"ru": "djlw2", "en": "", "tj": ""},
                    "clubs": {"ru": "djqlwe", "en": "", "tj": ""},
                    "level": {"ru": "djlw", "en": "", "tj": ""},
                    "type": {"ru": "djqkw", "en": "", "tj": ""},
                    "subject": {"ru": "Русский, Русский Алфавит, Чтение, Ремесло / Искусство, Английский, Математика", "en": "Russian, Russian Alphabet, Reading, Craft / Art, English, Math", "tj": "Русӣ, Алифбои Русӣ, Хондан, Ҳунар / Санъат, Забони англисӣ, Математика"},
                    "price": "120 TJS"
                }
            ]
        }

        # Seed English courses
        for item in courses_json["english"]:
            EnglishCourse.objects.update_or_create(
                external_id=item.get("id"),
                defaults={
                    "title_ru": item["title"]["ru"],
                    "title_en": item["title"]["en"],
                    "title_tj": item["title"]["tj"],
                    "description_ru": item["description"]["ru"],
                    "description_en": item["description"]["en"],
                    "description_tj": item["description"]["tj"],
                    "duration_ru": item["duration"]["ru"],
                    "duration_en": item["duration"]["en"],
                    "duration_tj": item["duration"]["tj"],
                    "academic_support_ru": item["academicSupport"]["ru"],
                    "academic_support_en": item["academicSupport"]["en"],
                    "academic_support_tj": item["academicSupport"]["tj"],
                    "clubs_ru": item["clubs"]["ru"],
                    "clubs_en": item["clubs"]["en"],
                    "clubs_tj": item["clubs"]["tj"],
                    "level_ru": item["level"]["ru"],
                    "level_en": item["level"]["en"],
                    "level_tj": item["level"]["tj"],
                    "type_ru": item["type"]["ru"],
                    "type_en": item["type"]["en"],
                    "type_tj": item["type"]["tj"],
                    "price": item.get("price", ""),
                }
            )

        # Seed Russian courses
        for item in courses_json["russian"]:
            RussianCourse.objects.update_or_create(
                external_id=item.get("id"),
                defaults={
                    "title_ru": item["title"]["ru"],
                    "title_en": item["title"]["en"],
                    "title_tj": item["title"]["tj"],
                    "description_ru": item["description"]["ru"],
                    "description_en": item["description"]["en"],
                    "description_tj": item["description"]["tj"],
                    "duration_ru": item["duration"]["ru"],
                    "duration_en": item["duration"]["en"],
                    "duration_tj": item["duration"]["tj"],
                    "academic_support_ru": item["academicSupport"]["ru"],
                    "academic_support_en": item["academicSupport"]["en"],
                    "academic_support_tj": item["academicSupport"]["tj"],
                    "clubs_ru": item["clubs"]["ru"],
                    "clubs_en": item["clubs"]["en"],
                    "clubs_tj": item["clubs"]["tj"],
                    "level_ru": item["level"]["ru"],
                    "level_en": item["level"]["en"],
                    "level_tj": item["level"]["tj"],
                    "type_ru": item["type"]["ru"],
                    "type_en": item["type"]["en"],
                    "type_tj": item["type"]["tj"],
                    "price": item.get("price", ""),
                }
            )

        # Seed PreSchools
        for item in courses_json["preSchools"]:
            PreSchoolCourse.objects.update_or_create(
                external_id=item.get("id"),
                defaults={
                    "title_ru": item["title"]["ru"],
                    "title_en": item["title"]["en"],
                    "title_tj": item["title"]["tj"],
                    "description_ru": item["description"]["ru"],
                    "description_en": item["description"]["en"],
                    "description_tj": item["description"]["tj"],
                    "duration_ru": item["duration"]["ru"],
                    "duration_en": item["duration"]["en"],
                    "duration_tj": item["duration"]["tj"],
                    "academic_support_ru": item["academicSupport"]["ru"],
                    "academic_support_en": item["academicSupport"]["en"],
                    "academic_support_tj": item["academicSupport"]["tj"],
                    "clubs_ru": item["clubs"]["ru"],
                    "clubs_en": item["clubs"]["en"],
                    "clubs_tj": item["clubs"]["tj"],
                    "level_ru": item["level"]["ru"],
                    "level_en": item["level"]["en"],
                    "level_tj": item["level"]["tj"],
                    "type_ru": item["type"]["ru"],
                    "type_en": item["type"]["en"],
                    "type_tj": item["type"]["tj"],
                    "subject_ru": item.get("subject", {}).get("ru", ""),
                    "subject_en": item.get("subject", {}).get("en", ""),
                    "subject_tj": item.get("subject", {}).get("tj", ""),
                    "price": item.get("price", ""),
                }
            )

        self.stdout.write(self.style.SUCCESS("All courses successfully seeded!"))
