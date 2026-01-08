#!/bin/bash
# Скрипт для выполнения НА СЕРВЕРЕ для установки systemd сервиса
# Скопируйте этот скрипт на сервер и выполните: bash setup_service_on_server.sh

set -e

echo "=========================================="
echo "  Установка aplus-django.service"
echo "=========================================="
echo ""

# Определяем путь к проекту
if [ -f "content_api/manage.py" ]; then
    PROJECT_DIR=$(pwd)
elif [ -f "../content_api/manage.py" ]; then
    PROJECT_DIR=$(cd .. && pwd)
else
    echo "Ошибка: Не могу найти content_api/manage.py"
    echo "Перейдите в корень проекта (где находится content_api/)"
    exit 1
fi

echo "✓ Найден проект в: $PROJECT_DIR"
echo ""

# Проверяем наличие venv
if [ ! -d "$PROJECT_DIR/content_api/venv" ]; then
    echo "⚠ Внимание: venv не найден в $PROJECT_DIR/content_api/venv"
    echo "Убедитесь, что виртуальное окружение создано"
fi

# Проверяем наличие gunicorn_config.py
GUNICORN_CONFIG=""
if [ -f "$PROJECT_DIR/nginx/gunicorn_config.py" ]; then
    GUNICORN_CONFIG="$PROJECT_DIR/nginx/gunicorn_config.py"
elif [ -f "$PROJECT_DIR/content_api/gunicorn_config.py" ]; then
    GUNICORN_CONFIG="$PROJECT_DIR/content_api/gunicorn_config.py"
else
    echo "⚠ Внимание: gunicorn_config.py не найден"
    echo "Создайте его или укажите путь вручную"
fi

echo "✓ Конфигурация Gunicorn: $GUNICORN_CONFIG"
echo ""

# Создаем файл сервиса
SERVICE_FILE="/tmp/aplus-django.service"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=A+ Learning Center Django Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR/content_api
Environment="PATH=$PROJECT_DIR/content_api/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=content_api.settings"
ExecStart=$PROJECT_DIR/content_api/venv/bin/gunicorn \\
    --config $GUNICORN_CONFIG \\
    content_api.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-django
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Файл сервиса создан"
echo ""
echo "Содержимое файла сервиса:"
echo "----------------------------------------"
cat "$SERVICE_FILE"
echo "----------------------------------------"
echo ""

# Копируем в systemd
echo "Копирование в /etc/systemd/system/..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/aplus-django.service

# Перезагружаем systemd
echo "Перезагрузка systemd daemon..."
sudo systemctl daemon-reload

# Включаем автозапуск
echo "Включение автозапуска..."
sudo systemctl enable aplus-django

echo ""
echo "=========================================="
echo "  ✓ Сервис установлен!"
echo "=========================================="
echo ""
echo "Теперь запустите сервис:"
echo "  sudo systemctl start aplus-django"
echo ""
echo "Проверьте статус:"
echo "  sudo systemctl status aplus-django"
echo ""





