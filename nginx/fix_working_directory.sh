#!/bin/bash
# Исправление WorkingDirectory и пути к wsgi
# Выполните на сервере: bash fix_working_directory.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ WORKING DIRECTORY"
echo "=========================================="
echo ""

# Правильные пути
WORK_DIR="/var/www/aplus/finalA-/content_api"  # Где находится manage.py
VENV_PATH="/var/www/aplus/finalA-/content_api/venv"
PYTHON_PATH="$VENV_PATH/bin/python"
CONFIG_PATH="/var/www/aplus/finalA-/nginx/gunicorn_config.py"
WSGI_PATH="content_api.wsgi:application"  # Так как WorkingDirectory = content_api/

echo "Рабочая директория: $WORK_DIR"
echo "Python: $PYTHON_PATH"
echo "WSGI путь: $WSGI_PATH"
echo ""

# Проверяем существование
if [ ! -f "$WORK_DIR/manage.py" ]; then
    echo "❌ Ошибка: manage.py не найден в $WORK_DIR"
    exit 1
fi
echo "✓ manage.py найден"

if [ ! -f "$WORK_DIR/content_api/wsgi.py" ]; then
    echo "❌ Ошибка: wsgi.py не найден в $WORK_DIR/content_api/"
    exit 1
fi
echo "✓ wsgi.py найден"

# Создаем правильный сервис
echo ""
echo "Создание файла сервиса..."
sudo bash -c "cat > /etc/systemd/system/aplus-django.service << EOF
[Unit]
Description=A+ Learning Center Django Application
After=network.target

[Service]
Type=notify
User=root
Group=root
WorkingDirectory=$WORK_DIR
Environment=\"PATH=$VENV_PATH/bin\"
Environment=\"DJANGO_SETTINGS_MODULE=content_api.settings\"
ExecStart=$PYTHON_PATH -m gunicorn \\
    --config $CONFIG_PATH \\
    $WSGI_PATH
ExecReload=/bin/kill -s HUP \\\$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-django

[Install]
WantedBy=multi-user.target
EOF"

echo "✓ Файл сервиса создан"
echo ""

# Перезагружаем systemd
echo "Перезагрузка systemd..."
sudo systemctl daemon-reload

# Останавливаем старый сервис
echo "Остановка старого сервиса..."
sudo systemctl stop aplus-django 2>/dev/null || true

# Запускаем новый
echo "Запуск нового сервиса..."
sudo systemctl start aplus-django

# Ждем
sleep 3

# Проверяем статус
echo ""
echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
sudo systemctl status aplus-django --no-pager -l

echo ""
echo "Проверка ответа Django:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ || echo "000")
echo "HTTP код: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✓ Django работает!"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "⚠ 400 ошибка - проверьте ALLOWED_HOSTS"
else
    echo "❌ Django не отвечает"
    echo "Проверьте логи: sudo journalctl -u aplus-django -n 30 --no-pager"
fi

echo ""




