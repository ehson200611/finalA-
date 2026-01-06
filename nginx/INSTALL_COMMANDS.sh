#!/bin/bash
# Команды для выполнения на вашем локальном компьютере
# Скопируйте и выполните эти команды в терминале

SERVER_IP="89.23.100.163"
SERVER_USER="root"
SERVER_PASS="p@wi^w59YZLMyN"

echo "=========================================="
echo "  Команды для установки на сервер"
echo "=========================================="
echo ""
echo "1. Установите sshpass (если нет):"
echo "   sudo apt-get install sshpass"
echo ""
echo "2. Создайте архив с конфигурацией:"
echo "   cd 'A+ pr'"
echo "   tar -czf /tmp/nginx_config.tar.gz nginx/nginx.conf nginx/gunicorn_config.py nginx/aplus-django.service nginx/ssl/ nginx/deploy_to_server.sh nginx/install_ssl.sh"
echo ""
echo "3. Скопируйте архив на сервер:"
echo "   sshpass -p '$SERVER_PASS' scp -o StrictHostKeyChecking=no /tmp/nginx_config.tar.gz $SERVER_USER@$SERVER_IP:/tmp/"
echo ""
echo "4. Выполните установку на сервере:"
echo "   sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'cd /tmp && tar -xzf nginx_config.tar.gz && cd nginx && chmod +x deploy_to_server.sh install_ssl.sh && bash deploy_to_server.sh'"
echo ""
echo "5. Скопируйте файлы проекта:"
echo "   rsync -avz --exclude 'node_modules' --exclude '__pycache__' --exclude '.next' --exclude 'venv' --exclude '.git' --exclude 'db.sqlite3' 'A+ pr/' $SERVER_USER@$SERVER_IP:/var/www/aplus/"
echo ""

