# vacancy/management/commands/seed_vacancyquestions.py
from django.core.management.base import BaseCommand
from vacancy.models import VacancyQuestion

class Command(BaseCommand):
    help = "Seed VacancyQuestion data"

    def handle(self, *args, **options):
        data = [
            {
                "question_en": "Can I share my experience personally with the methodologist?",
                "question_ru": "Можно ли рассказать об опыте лично методисту?",
                "question_tj": "Оё метавонам таҷрибаи худро шахсан ба методист нақл кунам?",
                "answer_en": "Audio interviews with recorded answers are the only format we currently use. ...",
                "answer_ru": "Аудиоинтервью с записью ответов — единственный формат, который мы сейчас используем. ...",
                "answer_tj": "Мусоҳибаҳои аудио бо сабти ҷавобҳо ягона формати ҳозира мебошанд. ..."
            },
            {
                "question_en": "How is the payment made?",
                "question_ru": "Каким образом происходит оплата?",
                "question_tj": "Ҳудуди пардохт чӣ гуна сурат мегирад?",
                "answer_en": "Payments are made to 'Mir' cards in rubles. ...",
                "answer_ru": "На карты «Мир» в рублях. ...",
                "answer_tj": "Пардохт ба корти «Мир» ба рубл сурат мегирад. ..."
            },
            {
                "question_en": "Can I teach lessons from a phone/tablet?",
                "question_ru": "Можно ли вести уроки с телефона/планшета?",
                "question_tj": "Оё метавонам дарсҳоро аз телефон/планшет гузаронам?",
                "answer_en": "No, teaching on the platform requires a PC or laptop.",
                "answer_ru": "Нет, для преподавания на платформе необходимы ПК или ноутбук.",
                "answer_tj": "Не, барои омӯзиш дар платформа ба компютер ё ноутбук ниёз аст."
            },
        ]

        for item in data:
            VacancyQuestion.objects.create(**item)
        self.stdout.write(self.style.SUCCESS("VacancyQuestion data seeded successfully!"))
