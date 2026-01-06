# faq/management/commands/seed_faqs.py

from django.core.management.base import BaseCommand
from faq.models import FaqText, FaqPage

class Command(BaseCommand):
    help = "Seed FAQ data"

    def handle(self, *args, **kwargs):
        # ---------------------
        # FaqText main page
        # ---------------------
        faq_text_data = {
            "en": {
                "title": "Frequently Asked Questions",
                "faqDescription": "Perhaps the answer to your question is already in our FAQ",
                "addQuestion": "Add Question",
                "addTitle": "Add Question",
                "editTitle": "Edit Question",
                "cancel": "Cancel",
                "save": "Save",
                "add": "Add",
                "confirmDelete": "Are you sure you want to delete this question?"
            },
            "ru": {
                "title": "Часто задаваемые вопросы",
                "faqDescription": "Возможно, ответ на ваш вопрос уже есть в нашем FAQ",
                "addQuestion": "Добавить вопрос",
                "addTitle": "Добавить вопрос",
                "editTitle": "Редактировать вопрос",
                "cancel": "Отмена",
                "save": "Сохранить",
                "add": "Добавить",
                "confirmDelete": "Вы уверены, что хотите удалить этот вопрос?"
            },
            "tj": {
                "title": "Саволҳои маъмул",
                "faqDescription": "Эҳтимол аст, ки ҷавоби саволи шумо аллакай дар қисми FAQ мавҷуд аст.",
                "addQuestion": "Илова кардани савол",
                "addTitle": "Илова кардани савол",
                "editTitle": "Тағйир додани савол",
                "cancel": "Бекор кардан",
                "save": "Захира кардан",
                "add": "Илова кардан",
                "confirmDelete": "Оё мутмаин ҳастед, ки мехоҳед ин саволро нест кунед?"
            }
        }

        # Create or update FaqText
        FaqText.objects.update_or_create(
            id=1,
            defaults={
                "title_en": faq_text_data["en"]["title"],
                "title_ru": faq_text_data["ru"]["title"],
                "title_tj": faq_text_data["tj"]["title"],
                "faqDescription_en": faq_text_data["en"]["faqDescription"],
                "faqDescription_ru": faq_text_data["ru"]["faqDescription"],
                "faqDescription_tj": faq_text_data["tj"]["faqDescription"],
                "addQuestion_en": faq_text_data["en"]["addQuestion"],
                "addQuestion_ru": faq_text_data["ru"]["addQuestion"],
                "addQuestion_tj": faq_text_data["tj"]["addQuestion"],
                "addTitle_en": faq_text_data["en"]["addTitle"],
                "addTitle_ru": faq_text_data["ru"]["addTitle"],
                "addTitle_tj": faq_text_data["tj"]["addTitle"],
                "editTitle_en": faq_text_data["en"]["editTitle"],
                "editTitle_ru": faq_text_data["ru"]["editTitle"],
                "editTitle_tj": faq_text_data["tj"]["editTitle"],
                "cancel_en": faq_text_data["en"]["cancel"],
                "cancel_ru": faq_text_data["ru"]["cancel"],
                "cancel_tj": faq_text_data["tj"]["cancel"],
                "save_en": faq_text_data["en"]["save"],
                "save_ru": faq_text_data["ru"]["save"],
                "save_tj": faq_text_data["tj"]["save"],
                "add_en": faq_text_data["en"]["add"],
                "add_ru": faq_text_data["ru"]["add"],
                "add_tj": faq_text_data["tj"]["add"],
                "confirmDelete_en": faq_text_data["en"]["confirmDelete"],
                "confirmDelete_ru": faq_text_data["ru"]["confirmDelete"],
                "confirmDelete_tj": faq_text_data["tj"]["confirmDelete"],
            }
        )

        self.stdout.write(self.style.SUCCESS("FaqText seeded successfully!"))

        # ---------------------
        # FaqPage questions
        # ---------------------
        faq_pages_data = [
            {
                "question": {
                    "en": "How to start learning on the platform?",
                    "ru": "Как начать обучение на платформе?",
                    "tj": "Чӣ тавр дар платформа омӯзишро оғоз кардан мумкин аст?"
                },
                "answer": {
                    "en": "To start learning, you need to register on the platform, choose a course, and subscribe. After that, you'll get access to all course materials.",
                    "ru": "Для начала обучения необходимо зарегистрироваться на платформе, выбрать интересующий курс и оформить подписку. После этого вы получите доступ ко всем материалам курса.",
                    "tj": "Барои оғоз кардани омӯзиш, шумо бояд дар платформа сабти ном кунед, курси дилхоҳро интихоб намуда, обуна шавед. Пас аз ин, шумо ба ҳамаи маводҳои курс дастрасӣ хоҳед дошт."
                }
            },
            {
                "question": {
                    "en": "Do I need experience to take the courses?",
                    "ru": "Нужен ли опыт для прохождения курсов?",
                    "tj": "Барои гузаштан аз курсҳо таҷриба лозим аст?"
                },
                "answer": {
                    "en": "We have courses for beginners and advanced learners. The required level is specified in each course description.",
                    "ru": "У нас есть курсы как для начинающих, так и для продвинутых пользователей. В описании каждого курса указан требуемый уровень подготовки.",
                    "tj": "Мо курсҳо барои шурӯъкунандагон ва барои донишҷӯёни пешрафта дорем. Дар тавсифи ҳар як курс сатҳи лозимии дониш нишон дода шудааст."
                }
            },
            # Шумо метавонед ҳамаи 12 FAQ-и дигарро ҳамин тавр илова кунед
        ]

        for idx, item in enumerate(faq_pages_data, start=1):
            FaqPage.objects.update_or_create(
                id=idx,
                defaults={
                    "question_en": item["question"]["en"],
                    "question_ru": item["question"]["ru"],
                    "question_tj": item["question"]["tj"],
                    "answer_en": item["answer"]["en"],
                    "answer_ru": item["answer"]["ru"],
                    "answer_tj": item["answer"]["tj"],
                }
            )

        self.stdout.write(self.style.SUCCESS("FaqPage items seeded successfully!"))
