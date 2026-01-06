# Установка на удаленный сервер

## Вариант 1: Автоматическая установка (рекомендуется)

### Шаг 1: Установите sshpass (если нет)
```bash
sudo apt-get install sshpass
```

### Шаг 2: Запустите скрипт автоматической установки
```bash
cd nginx
bash connect_and_deploy.sh
```

Скрипт автоматически:
- Подключится к серверу
- Скопирует все конфигурационные файлы
- Установит необходимые пакеты
- Настроит Nginx и SSL
- Настроит systemd service

### Шаг 3: Скопируйте файлы проекта на сервер

```bash
# Из корневой директории проекта
rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' \
  --exclude 'venv' --exclude '.git' \
  "A+ pr/" root@89.23.100.163:/var/www/aplus/
```

Или используйте scp:
```bash
scp -r "A+ pr" root@89.23.100.163:/var/www/aplus
```

## Вариант 2: Ручная установка

### Шаг 1: Подключитесь к серверу
```bash
ssh root@89.23.100.163
# Пароль: p@wi^w59YZLMyN
```

### Шаг 2: Скопируйте файлы на сервер

На вашем локальном компьютере:
```bash
# Создайте архив с конфигурацией
cd "A+ pr"
tar -czf nginx_config.tar.gz nginx/

# Скопируйте на сервер
scp nginx_config.tar.gz root@89.23.100.163:/tmp/
```

### Шаг 3: На сервере выполните установку

```bash
# Подключитесь к серверу
ssh root@89.23.100.163

# Распакуйте архив
cd /tmp
tar -xzf nginx_config.tar.gz
cd nginx

# Запустите скрипт установки
chmod +x deploy_to_server.sh install_ssl.sh
bash deploy_to_server.sh
```

### Шаг 4: Скопируйте файлы проекта

На вашем локальном компьютере:
```bash
rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' \
  --exclude 'venv' --exclude '.git' \
  "A+ pr/" root@89.23.100.163:/var/www/aplus/
```

## После копирования файлов проекта

### На сервере выполните:

```bash
# 1. Настройка Django
cd /var/www/aplus/content_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Обновите settings.py:
# - DEBUG = False
# - ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', '89.23.100.163']
# - Настройте базу данных (PostgreSQL рекомендуется)

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# 2. Настройка Next.js
cd /var/www/aplus/frontenda/Learning-center-A-Client
npm install
echo "NEXT_PUBLIC_API_URL=https://aplus.tj" > .env.local
npm run build

# 3. Запуск сервисов
systemctl start aplus-django
systemctl restart nginx

# 4. Проверка
systemctl status aplus-django
systemctl status nginx
curl -I https://aplus.tj
```

## Настройка базы данных PostgreSQL (рекомендуется)

```bash
# На сервере
sudo -u postgres psql

# В PostgreSQL:
CREATE DATABASE aplus_db;
CREATE USER aplus_user WITH PASSWORD 'your_secure_password';
ALTER ROLE aplus_user SET client_encoding TO 'utf8';
ALTER ROLE aplus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aplus_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aplus_db TO aplus_user;
\q
```

Затем обновите `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'aplus_db',
        'USER': 'aplus_user',
        'PASSWORD': 'your_secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Проверка работы

```bash
# Проверка сервисов
systemctl status aplus-django
systemctl status nginx

# Проверка логов
journalctl -u aplus-django -f
tail -f /var/log/nginx/aplus_error.log

# Проверка сайта
curl -I https://aplus.tj
```

## Устранение проблем

### Если Nginx не запускается:
```bash
sudo nginx -t  # Проверка конфигурации
sudo tail -f /var/log/nginx/error.log
```

### Если Django не запускается:
```bash
sudo journalctl -u aplus-django -n 50
# Проверьте пути в aplus-django.service
```

### Если SSL не работает:
```bash
# Проверьте наличие сертификатов
ls -la /etc/nginx/ssl/

# Проверьте права доступа
sudo chmod 600 /etc/nginx/ssl/aplus.tj.key
sudo chmod 644 /etc/nginx/ssl/aplus.tj.crt
```

