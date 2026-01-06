# Создайте файл test_views.py в корне проекта:
# test_views.py
import json
from django.test import TestCase
from drf_spectacular.utils import extend_schema, OpenApiResponse
from authenticator.serializers import UserProfileSerializer, AdminRoleSerializer

# Тест 1: Проверка сериализатора
print("Тест 1: Проверка сериализаторов...")
try:
    data = UserProfileSerializer(many=True)
    print(f"UserProfileSerializer(many=True): {type(data)}")
except Exception as e:
    print(f"Ошибка: {e}")

# Тест 2: Проверка в OpenApiResponse
print("\nТест 2: Проверка OpenApiResponse...")
try:
    response = OpenApiResponse(
        response=UserProfileSerializer(many=True),
        description='Test'
    )
    print(f"OpenApiResponse с many=True: OK")
except Exception as e:
    print(f"Ошибка: {e}")

# Тест 3: Проверка JSON сериализации
print("\nТест 3: Проверка JSON сериализации...")
try:
    test_data = {"response": UserProfileSerializer(many=True)}
    json_str = json.dumps(test_data)
    print("JSON сериализация: OK")
except Exception as e:
    print(f"Ошибка JSON: {e}")