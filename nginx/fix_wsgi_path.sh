#!/bin/bash
# Исправление пути к wsgi.py
# Выполните на сервере: bash fix_wsgi_path.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ ПУТИ К WSGI"
echo "=========================================="
echo ""

WORK_DIR="/var/www/aplus/finalA-"

# Проверяем структуру проекта
echo "Проверка структуры проекта..."
echo "----------------------------------------"

if [ -f "$WORK_DIR/manage.py" ]; then
    echo "✓ manage.py найден в: $WORK_DIR"
else
    echo "❌ manage.py не найден!"
    exit 1
fi

# Проверяем, где находится wsgi.py
if [ -f "$WORK_DIR/content_api/content_api/wsgi.py" ]; then
    WSGI_PATH="content_api.content_api.wsgi:application"
    echo "✓ wsgi.py найден в: $WORK_DIR/content_api/content_api/wsgi.py"
    echo "✓ Используем путь: $WSGI_PATH"
elif [ -f "$WORK_DIR/content_api/wsgi.py" ]; then
    WSGI_PATH="content_api.wsgi:application"
    echo "✓ wsgi.py найден в: $WORK_DIR/content_api/wsgi.py"
    echo "✓ Используем путь: $WSGI_PATH"
else
    echo "❌ wsgi.py не найден!"
    echo "Ищем wsgi.py..."
    find "$WORK_DIR" -name "wsgi.py" -type f
    exit 1
fi

VENV_PATH="/var/www/aplus/finalA-/content_api/venv"
PYTHON_PATH="$VENV_PATH/bin/python"
CONFIG_PATH="/var/www/aplus/finalA-/nginx/gunicorn_config.py"

# Создаем правильный сервис
echo ""
echo "Создание файла сервиса с правильным путем к wsgi..."
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
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:8000/api/ || echo "Django не отвечает"

echo ""
echo "Если есть ошибки, проверьте логи:"
echo "  sudo journalctl -u aplus-django -n 30 --no-pager"
echo ""




