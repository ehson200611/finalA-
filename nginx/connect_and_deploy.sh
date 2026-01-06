#!/bin/bash

# Скрипт для подключения к серверу и выполнения установки
# Использование: ./connect_and_deploy.sh

SERVER_IP="89.23.100.163"
SERVER_USER="root"
SERVER_PASS="p@wi^w59YZLMyN"
PROJECT_NAME="A+ pr"

echo "Подключение к серверу $SERVER_USER@$SERVER_IP..."

# Проверка наличия sshpass
if ! command -v sshpass &> /dev/null; then
    echo "Установка sshpass..."
    sudo apt-get update
    sudo apt-get install -y sshpass
fi

# Создание временной директории для файлов
TEMP_DIR=$(mktemp -d)
echo "Создание архива с конфигурацией..."

# Копирование необходимых файлов
cd "$(dirname "$0")/.."
tar -czf "$TEMP_DIR/nginx_config.tar.gz" \
    nginx/nginx.conf \
    nginx/gunicorn_config.py \
    nginx/aplus-django.service \
    nginx/ssl/ \
    nginx/deploy_to_server.sh \
    nginx/install_ssl.sh

# Копирование файлов на сервер
echo "Копирование файлов на сервер..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$TEMP_DIR/nginx_config.tar.gz" "$SERVER_USER@$SERVER_IP:/tmp/"

# Выполнение команд на сервере
echo "Выполнение установки на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    cd /tmp
    tar -xzf nginx_config.tar.gz
    cd nginx
    chmod +x deploy_to_server.sh install_ssl.sh
    bash deploy_to_server.sh
    rm -rf /tmp/nginx_config.tar.gz /tmp/nginx
ENDSSH

# Очистка
rm -rf "$TEMP_DIR"

echo ""
echo "Готово! Теперь скопируйте файлы проекта на сервер."
echo ""
echo "Для копирования проекта используйте:"
echo "  scp -r 'A+ pr' root@89.23.100.163:/var/www/aplus"
echo ""
echo "Или используйте rsync:"
echo "  rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' 'A+ pr/' root@89.23.100.163:/var/www/aplus/"

