#!/bin/bash
# Скрипт для выполнения установки на сервер
# Запустите: bash run_install.sh

set -e

SERVER_IP="89.23.100.163"
SERVER_USER="root"
SERVER_PASS="p@wi^w59YZLMyN"

echo "=========================================="
echo "  Установка на сервер $SERVER_IP"
echo "=========================================="
echo ""

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите его:"
    echo "   sudo apt-get install sshpass"
    echo ""
    echo "Или выполните команды вручную из файла QUICK_INSTALL.txt"
    exit 1
fi

# Переход в директорию проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "Шаг 1: Создание архива с конфигурацией..."
tar -czf /tmp/nginx_config.tar.gz \
    nginx/nginx.conf \
    nginx/gunicorn_config.py \
    nginx/aplus-django.service \
    nginx/ssl/ \
    nginx/deploy_to_server.sh \
    nginx/install_ssl.sh

echo "Шаг 2: Копирование на сервер..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/nginx_config.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"

echo "Шаг 3: Выполнение установки на сервере..."
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
echo "  ✓ Установка конфигурации завершена!"
echo "=========================================="
echo ""
echo "Следующий шаг: Скопируйте файлы проекта"
echo ""
echo "Выполните:"
echo "  rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' \\"
echo "    --exclude 'venv' --exclude '.git' --exclude 'db.sqlite3' \\"
echo "    'A+ pr/' root@89.23.100.163:/var/www/aplus/"
echo ""
echo "Или запустите:"
echo "  bash nginx/copy_project.sh"
echo ""

