# contacts/management/commands/seed_contacts.py
from django.core.management.base import BaseCommand
from contact.models import Contact

class Command(BaseCommand):
    help = "Seed contacts data directly from JSON"

    def handle(self, *args, **kwargs):
        # JSON-и contacts бевосита
        contacts_data = [
            {
                "id": "1",
                "name": "A+ Academy ",
                "title": "Душанбе, Таджикистан",
                "address": "Душанбе, улица Рахими, 12",
                "phone": "+992 982 300 300",
                "email": "aplus.hr@outlook.com",
                "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2955.122502045906!2d68.77387947694283!3d38.5597724717776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b54f7e58a2b3af%3A0x2a3fbe92b52c85ad!2z0JTQvtC80LDRgNGF0L3QsNC70YzRgdC60LjQuSDQkNC90YLQtdC60YHQutCw0Y8!5e0!3m2!1sru!2s!4v1724792469876!5m2!1sru!2s",
                "hours": "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00"
            },
            {
                "id": "2",
                "name": "A+ Центр",
                "title": "Учебный Центр A+",
                "address": "Душанбе, улица Рахими, 12",
                "phone": "+992 07 310 03 00",
                "email": "aplus.hr@outlook.com",
                "iframe": "https://yandex.tj/map-widget/v1/?ll=68.754339%2C38.512102&z=18",
                "hours": "Пн-Пт: 8:00-20:00, Сб-Вс: 9:00-17:00"
            },
            {
                "id": "d41d",
                "name": "A+ Водонасос",
                "title": "A+ в Водонасосе",
                "address": "Душанбе, Водонасос",
                "phone": "+992 982 300 330",
                "email": "aplus.educ1@gmail.com",
                "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2955.3!2d68.81!3d38.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b54fXXXXXXX!2sA+%20Vodanasos!5e0!3m2!1sru!2s!4v1724792469876!5m2!1sru!2s",
                "hours": "Пн-Пт: 9:00-19:00, Сб: 10:00-15:00"
            }
        ]

        for item in contacts_data:
            contact, created = Contact.objects.update_or_create(
                external_id=item.get("id"),  # барои unique key
                defaults={
                    "name": item.get("name", ""),
                    "title": item.get("title", ""),
                    "address": item.get("address", ""),
                    "phone": item.get("phone", ""),
                    "email": item.get("email", ""),
                    "iframe": item.get("iframe", ""),
                    "hours": item.get("hours", ""),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created contact: {contact.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated contact: {contact.name}"))

        self.stdout.write(self.style.SUCCESS("All contacts successfully seeded!"))
