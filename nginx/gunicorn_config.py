# Конфигурация Gunicorn для Django приложения
# Использование: gunicorn content_api.wsgi:application --config gunicorn_config.py

import multiprocessing
import os

# Базовый путь к проекту
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Количество воркеров (рекомендуется: количество CPU * 2 + 1)
workers = multiprocessing.cpu_count() * 2 + 1

# Тип воркеров
worker_class = 'sync'

# Таймауты
timeout = 300
keepalive = 5

# Биндинг
bind = '127.0.0.1:8000'

# Логи
accesslog = os.path.join(BASE_DIR, 'logs', 'gunicorn_access.log')
errorlog = os.path.join(BASE_DIR, 'logs', 'gunicorn_error.log')
loglevel = 'info'

# Перезапуск при изменении кода (только для разработки)
reload = False

# Имя процесса
proc_name = 'aplus_django'

# Пользователь и группа (раскомментируйте и настройте для production)
# user = 'www-data'
# group = 'www-data'

# Максимальные запросы на воркер перед перезапуском
max_requests = 1000
max_requests_jitter = 50

# Предзагрузка приложения
preload_app = True

# Переменные окружения
raw_env = [
    'DJANGO_SETTINGS_MODULE=content_api.settings',
]

