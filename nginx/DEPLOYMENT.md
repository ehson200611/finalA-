# Инструкция по развертыванию проекта A+ Learning Center

## Требования

- Ubuntu/Debian сервер
- Python 3.10+
- Node.js 18+
- Nginx
- PostgreSQL (рекомендуется) или SQLite
- SSL сертификат (Let's Encrypt)

## Шаги развертывания

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib git build-essential
sudo apt install -y nodejs npm

# Установка Node.js 18+ (если версия старая)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Настройка базы данных PostgreSQL (рекомендуется)

```bash
# Вход в PostgreSQL
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE aplus_db;
CREATE USER aplus_user WITH PASSWORD 'your_secure_password';
ALTER ROLE aplus_user SET client_encoding TO 'utf8';
ALTER ROLE aplus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aplus_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aplus_db TO aplus_user;
\q
```

### 3. Клонирование и настройка проекта

```bash
# Создание директории для проекта
sudo mkdir -p /var/www/aplus
sudo chown $USER:$USER /var/www/aplus

# Копирование проекта (или клонирование из git)
# cd /var/www/aplus
# git clone <your-repo-url> .

# Или скопируйте файлы проекта в /var/www/aplus
```

### 4. Настройка Django Backend

```bash
cd /var/www/aplus/content_api

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
pip install gunicorn

# Обновление settings.py для production
# Установите DEBUG = False
# Настройте ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']
# Настройте DATABASES для PostgreSQL

# Применение миграций
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Сбор статических файлов
python manage.py collectstatic --noinput

# Создание директории для логов
mkdir -p logs
```

### 5. Настройка Gunicorn

```bash
# Скопируйте gunicorn_config.py в content_api/
cp /var/www/aplus/nginx/gunicorn_config.py /var/www/aplus/content_api/

# Обновите пути в gunicorn_config.py
# Обновите пути в aplus-django.service
```

### 6. Настройка Systemd Service

```bash
# Копирование service файла
sudo cp /var/www/aplus/nginx/aplus-django.service /etc/systemd/system/

# Обновление путей в файле (отредактируйте файл)
sudo nano /etc/systemd/system/aplus-django.service

# Перезагрузка systemd
sudo systemctl daemon-reload

# Запуск сервиса
sudo systemctl enable aplus-django
sudo systemctl start aplus-django

# Проверка статуса
sudo systemctl status aplus-django
```

### 7. Настройка Next.js Frontend

```bash
cd /var/www/aplus/frontenda/Learning-center-A-Client

# Установка зависимостей
npm install

# Создание .env.local файла
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your-domain.com
# или для HTTPS:
# NEXT_PUBLIC_API_URL=https://your-domain.com
EOF

# Сборка проекта
npm run build

# Проверка, что сборка прошла успешно
# Файлы должны быть в .next/ директории
```

### 8. Настройка Nginx

```bash
# Копирование конфигурации
sudo cp /var/www/aplus/nginx/nginx.conf /etc/nginx/sites-available/aplus

# Редактирование конфигурации
sudo nano /etc/nginx/sites-available/aplus

# Обновите следующие параметры:
# - server_name (ваш домен или IP)
# - пути к файлам проекта
# - пути к логам

# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/aplus /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (если есть)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 9. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

### 10. Настройка файрвола

```bash
# Разрешение HTTP и HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 11. Проверка работы

```bash
# Проверка Django сервиса
sudo systemctl status aplus-django
sudo journalctl -u aplus-django -f

# Проверка Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/aplus_error.log

# Проверка доступности
curl http://your-domain.com
curl http://your-domain.com/api/schema/
```

## Обновление проекта

```bash
# Остановка сервисов
sudo systemctl stop aplus-django

# Обновление кода
cd /var/www/aplus
git pull  # или скопируйте новые файлы

# Обновление Django
cd content_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Обновление Frontend
cd ../frontenda/Learning-center-A-Client
npm install
npm run build

# Запуск сервисов
sudo systemctl start aplus-django
sudo systemctl restart nginx
```

## Мониторинг и логи

```bash
# Логи Django/Gunicorn
sudo journalctl -u aplus-django -f
tail -f /var/www/aplus/content_api/logs/gunicorn_error.log

# Логи Nginx
sudo tail -f /var/log/nginx/aplus_access.log
sudo tail -f /var/log/nginx/aplus_error.log
```

## Резервное копирование

```bash
# Создание бэкапа базы данных
pg_dump -U aplus_user aplus_db > backup_$(date +%Y%m%d).sql

# Восстановление
psql -U aplus_user aplus_db < backup_YYYYMMDD.sql
```

## Важные замечания

1. **Безопасность:**
   - Измените SECRET_KEY в settings.py
   - Установите DEBUG = False
   - Настройте ALLOWED_HOSTS
   - Используйте сильные пароли для БД
   - Настройте регулярные бэкапы

2. **Производительность:**
   - Настройте количество воркеров Gunicorn в зависимости от CPU
   - Используйте PostgreSQL вместо SQLite для production
   - Настройте кеширование (Redis/Memcached)

3. **Мониторинг:**
   - Настройте мониторинг сервера (например, Prometheus + Grafana)
   - Настройте алерты для критических ошибок

## Устранение проблем

### Django не запускается
```bash
# Проверьте логи
sudo journalctl -u aplus-django -n 50

# Проверьте права доступа
sudo chown -R www-data:www-data /var/www/aplus/content_api
```

### Nginx возвращает 502
```bash
# Проверьте, запущен ли Django
sudo systemctl status aplus-django

# Проверьте, слушает ли Gunicorn на порту 8000
sudo netstat -tlnp | grep 8000
```

### Статические файлы не загружаются
```bash
# Проверьте права доступа
sudo chown -R www-data:www-data /var/www/aplus/content_api/staticfiles
sudo chown -R www-data:www-data /var/www/aplus/content_api/media

# Пересоберите статические файлы
cd /var/www/aplus/content_api
source venv/bin/activate
python manage.py collectstatic --noinput
```

