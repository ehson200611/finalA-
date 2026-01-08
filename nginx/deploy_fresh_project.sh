#!/bin/bash
# Развертывание нового проекта на сервере
# Выполните на вашем компьютере: bash deploy_fresh_project.sh

set -e

SERVER="root@89.23.100.163"
SERVER_PASS="p@wi^w59YZLMyN"
PROJECT_DIR="/var/www/aplus/finalA-"
LOCAL_PROJECT="/home/ehson/Рабочий стол/aplrpojjfinal"

echo "=========================================="
echo "  РАЗВЕРТЫВАНИЕ НОВОГО ПРОЕКТА"
echo "=========================================="
echo ""

# Проверяем sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите:"
    echo "   sudo apt-get install sshpass"
    exit 1
fi

# Переходим в корень проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DIR="$(dirname "$SCRIPT_DIR")"
cd "$LOCAL_DIR"

echo "Локальная директория: $LOCAL_DIR"
echo "Серверная директория: $PROJECT_DIR"
echo ""

# Создаем директорию на сервере
echo "1. Создание директории на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $PROJECT_DIR"
echo "✓ Директория создана"
echo ""

# Синхронизируем backend (Django)
echo "2. Синхронизация backend..."
rsync -avz --progress \
  --exclude 'venv' \
  --exclude '.venv' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'db.sqlite3' \
  --exclude '*.log' \
  --exclude 'media' \
  --exclude 'staticfiles' \
  "content_api/" \
  "$SERVER:$PROJECT_DIR/content_api/"
echo "✓ Backend синхронизирован"
echo ""

# Синхронизируем frontend
echo "3. Синхронизация frontend..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'package-lock.json' \
  "frontenda/Learning-center-A-Client/" \
  "$SERVER:$PROJECT_DIR/frontenda/Learning-center-A-Client/"
echo "✓ Frontend синхронизирован"
echo ""

# Синхронизируем nginx конфигурации
echo "4. Синхронизация nginx конфигураций..."
rsync -avz --progress \
  "nginx/" \
  "$SERVER:$PROJECT_DIR/nginx/"
echo "✓ Nginx конфигурации синхронизированы"
echo ""

# Выполняем настройку на сервере
echo "5. Настройка проекта на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
cd /var/www/aplus/finalA-

# 1. Настройка Django
echo "Настройка Django..."
cd content_api

# Создаем виртуальное окружение
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Устанавливаем зависимости
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    pip install django djangorestframework django-cors-headers gunicorn
fi

# Применяем миграции
python manage.py migrate

# Собираем статические файлы
python manage.py collectstatic --noinput

# 2. Настройка Next.js
echo "Настройка Next.js..."
cd ../frontenda/Learning-center-A-Client

# Устанавливаем зависимости
if [ ! -d "node_modules" ]; then
    npm install
fi

# Собираем проект
npm run build

# 3. Настройка systemd сервисов
echo "Настройка systemd сервисов..."
cd ../../nginx

# Копируем сервисы
sudo cp aplus-django.service /etc/systemd/system/
sudo cp aplus-nextjs.service /etc/systemd/system/

# Обновляем пути в сервисах (если нужно)
sudo sed -i "s|/var/www/aplus/finalA-|/var/www/aplus/finalA-|g" /etc/systemd/system/aplus-django.service
sudo sed -i "s|/var/www/aplus/finalA-|/var/www/aplus/finalA-|g" /etc/systemd/system/aplus-nextjs.service

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем и запускаем сервисы
sudo systemctl enable aplus-django
sudo systemctl enable aplus-nextjs
sudo systemctl start aplus-django
sudo systemctl start aplus-nextjs

# 4. Настройка Nginx
echo "Настройка Nginx..."
if [ -f "aplus" ]; then
    sudo cp aplus /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/aplus /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo ""
echo "✓ Проект настроен"
ENDSSH

echo ""
echo "=========================================="
echo "  РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте статус сервисов:"
echo "  ssh $SERVER 'sudo systemctl status aplus-django aplus-nextjs nginx'"
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

