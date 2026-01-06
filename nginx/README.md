# Nginx конфигурация для проекта A+ Learning Center

Этот каталог содержит все необходимые файлы для развертывания проекта на сервере с использованием Nginx.

## Файлы в этом каталоге:

### Основные конфигурации

- **nginx.conf** - Основная конфигурация Nginx с SSL для aplus.tj
- **nginx-nextjs-server.conf** - Альтернативная конфигурация, если Next.js работает как сервер
- **gunicorn_config.py** - Конфигурация Gunicorn для Django приложения
- **aplus-django.service** - Systemd service файл для автоматического запуска Django
- **install_ssl.sh** - Скрипт для автоматической установки SSL сертификатов

### SSL сертификаты

- **ssl/aplus.tj.key.txt** - Приватный ключ (текстовый формат для копирования)
- **ssl/aplus.tj.crt.txt** - SSL сертификат (текстовый формат для копирования)
- **SSL_SETUP.md** - Подробная инструкция по установке SSL
- **SSL_INSTALL.txt** - Краткая инструкция по установке SSL

### Документация

- **DEPLOYMENT.md** - Подробная инструкция по развертыванию
- **QUICK_START.md** - Быстрый старт для опытных пользователей
- **README.md** - Этот файл

### Примеры настроек

- **settings_production.py.example** - Пример production настроек для Django

## Структура проекта

```
A+ pr/
├── content_api/          # Django backend
│   ├── content_api/
│   │   └── settings.py
│   ├── manage.py
│   ├── media/           # Медиа файлы
│   └── staticfiles/     # Статические файлы (после collectstatic)
│
├── frontenda/
│   └── Learning-center-A-Client/  # Next.js frontend
│       ├── .next/       # Собранное приложение
│       └── package.json
│
└── nginx/               # Конфигурации для деплоя
    ├── nginx.conf
    ├── gunicorn_config.py
    └── ...
```

## Архитектура развертывания

```
Интернет
   ↓
Nginx (порт 80/443)
   ├── → Next.js Frontend (статические файлы или порт 3000)
   ├── → Django API (порт 8000 через Gunicorn)
   ├── → /static/ (Django статические файлы)
   └── → /media/ (Django медиа файлы)
```

## Быстрый старт

1. Прочитайте **QUICK_START.md** для быстрого развертывания
2. Установите SSL сертификаты (см. **SSL_INSTALL.txt** или **SSL_SETUP.md**)
3. Или следуйте подробной инструкции в **DEPLOYMENT.md**

## SSL сертификаты

Конфигурация уже настроена для домена **aplus.tj** с SSL. Для установки:

1. Используйте автоматический скрипт: `bash install_ssl.sh`
2. Или следуйте инструкции в **SSL_INSTALL.txt**

## Важные замечания

⚠️ **Перед использованием обновите:**
- Все пути к файлам проекта
- Доменные имена или IP адреса
- Настройки базы данных
- SECRET_KEY и пароли

## Поддержка

При возникновении проблем проверьте:
1. Логи Django: `sudo journalctl -u aplus-django -f`
2. Логи Nginx: `sudo tail -f /var/log/nginx/aplus_error.log`
3. Статус сервисов: `sudo systemctl status aplus-django nginx`

