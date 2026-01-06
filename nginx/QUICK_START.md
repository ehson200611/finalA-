# Быстрый старт - Развертывание на сервере

## Шаг 1: Подготовка путей

**ВАЖНО:** В файле `nginx.conf` обновите все пути с:
```
/home/ehson/Рабочий\ стол/A+\ pr/
```
на путь на вашем сервере, например:
```
/var/www/aplus/
```

## Шаг 2: Установка зависимостей

```bash
# Backend
cd content_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Frontend
cd ../frontenda/Learning-center-A-Client
npm install
```

## Шаг 3: Настройка Django

```bash
cd content_api
source venv/bin/activate

# Обновите settings.py:
# - DEBUG = False
# - ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', 'your-server-ip']
# - Настройте базу данных

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## Шаг 4: Настройка Next.js

```bash
cd frontenda/Learning-center-A-Client

# Создайте .env.local
echo "NEXT_PUBLIC_API_URL=https://aplus.tj" > .env.local

# Соберите проект
npm run build
```

## Шаг 5: Настройка Gunicorn

```bash
# Обновите пути в gunicorn_config.py
# Обновите пути в aplus-django.service

# Установите сервис
sudo cp nginx/aplus-django.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable aplus-django
sudo systemctl start aplus-django
```

## Шаг 6: Установка SSL сертификатов

```bash
# Создайте директорию для SSL
sudo mkdir -p /etc/nginx/ssl

# Скопируйте сертификаты (из файлов .txt или напрямую)
sudo cp nginx/ssl/aplus.tj.key.txt /etc/nginx/ssl/aplus.tj.key
sudo cp nginx/ssl/aplus.tj.crt.txt /etc/nginx/ssl/aplus.tj.crt

# Или используйте автоматический скрипт
cd nginx
bash install_ssl.sh

# Установите права доступа
sudo chmod 600 /etc/nginx/ssl/aplus.tj.key
sudo chmod 644 /etc/nginx/ssl/aplus.tj.crt
```

## Шаг 7: Настройка Nginx

```bash
# Обновите пути в nginx.conf (если нужно)
# Конфигурация уже настроена для aplus.tj с SSL

# Скопируйте конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/sites-available/aplus
sudo ln -s /etc/nginx/sites-available/aplus /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

## Шаг 8: Проверка

```bash
# Проверьте сервисы
sudo systemctl status aplus-django
sudo systemctl status nginx

# Проверьте логи
sudo journalctl -u aplus-django -f
sudo tail -f /var/log/nginx/aplus_error.log

# Проверьте SSL
curl -I https://aplus.tj
# Должен вернуть статус 200 или 301/302
```

## Что нужно изменить в конфигурации:

1. **nginx.conf:**
   - ✅ `server_name` - уже настроен для aplus.tj и www.aplus.tj
   - ✅ SSL настройки - уже активированы
   - ⚠️ Все пути к файлам проекта - обновите на пути на вашем сервере

2. **gunicorn_config.py:**
   - `BASE_DIR` - путь к content_api
   - `accesslog` и `errorlog` - пути к логам

3. **aplus-django.service:**
   - `WorkingDirectory` - путь к content_api
   - `ExecStart` - путь к gunicorn
   - `Environment PATH` - путь к venv

4. **settings.py:**
   - `DEBUG = False`
   - `ALLOWED_HOSTS`
   - Настройки базы данных

## Альтернатива: Next.js как сервер

Если хотите запускать Next.js как отдельный сервер (через PM2 или systemd):

1. Используйте `nginx-nextjs-server.conf` вместо `nginx.conf`
2. Запустите Next.js: `cd frontenda/Learning-center-A-Client && npm start`
3. Или создайте PM2 конфигурацию для Next.js

