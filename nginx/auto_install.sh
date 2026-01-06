#!/bin/bash

# Автоматическая установка на сервер 89.23.100.163
# Этот скрипт выполнит все необходимые настройки

SERVER_IP="89.23.100.163"
SERVER_USER="root"
SERVER_PASS="p@wi^w59YZLMyN"
PROJECT_PATH="/var/www/aplus"

echo "=========================================="
echo "  Автоматическая установка на сервер"
echo "  $SERVER_USER@$SERVER_IP"
echo "=========================================="
echo ""

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "Установка sshpass..."
    sudo apt-get update
    sudo apt-get install -y sshpass
fi

# Создание архива
echo "Создание архива с конфигурацией..."
cd "$(dirname "$0")/.."
tar -czf /tmp/nginx_config.tar.gz \
    nginx/nginx.conf \
    nginx/gunicorn_config.py \
    nginx/aplus-django.service \
    nginx/ssl/ \
    nginx/deploy_to_server.sh \
    nginx/install_ssl.sh 2>/dev/null

# Копирование на сервер
echo "Копирование файлов на сервер..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/nginx_config.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"

# Выполнение установки на сервере
echo "Выполнение установки на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    set -e
    cd /tmp
    tar -xzf nginx_config.tar.gz
    cd nginx
    chmod +x deploy_to_server.sh install_ssl.sh
    bash deploy_to_server.sh
    rm -rf /tmp/nginx_config.tar.gz /tmp/nginx
ENDSSH

echo ""
echo "=========================================="
echo "  Установка конфигурации завершена!"
echo "=========================================="
echo ""
echo "Теперь скопируйте файлы проекта:"
echo ""
echo "rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' \\"
echo "  --exclude 'venv' --exclude '.git' --exclude 'db.sqlite3' \\"
echo "  'A+ pr/' root@89.23.100.163:/var/www/aplus/"
echo ""
echo "Или выполните на сервере настройку Django и Next.js (см. REMOTE_INSTALL.md)"

