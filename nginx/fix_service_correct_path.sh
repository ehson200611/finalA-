#!/bin/bash
# Исправление сервиса с правильным путем
# Выполните на сервере: bash fix_service_correct_path.sh

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ СЕРВИСА С ПРАВИЛЬНЫМ ПУТЕМ"
echo "=========================================="
echo ""

# Определяем реальный путь
PROJECT_DIR="/var/www/aplus/finalA-"

echo "Используем путь: $PROJECT_DIR"
echo ""

# Проверяем существование
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Ошибка: Директория $PROJECT_DIR не существует!"
    echo "Найдите правильный путь:"
    echo "  find / -name 'manage.py' -type f 2>/dev/null | head -5"
    exit 1
fi

# Проверяем venv
if [ -d "$PROJECT_DIR/venv" ]; then
    VENV_PATH="$PROJECT_DIR/venv"
    echo "✓ Найден venv: $VENV_PATH"
elif [ -d "$PROJECT_DIR/.venv" ]; then
    VENV_PATH="$PROJECT_DIR/.venv"
    echo "✓ Найден venv: $VENV_PATH"
else
    echo "❌ Ошибка: venv не найден!"
    exit 1
fi

# Проверяем gunicorn
GUNICORN_PATH="$VENV_PATH/bin/gunicorn"
if [ ! -f "$GUNICORN_PATH" ]; then
    echo "❌ Gunicorn не найден! Установите его:"
    echo "  cd $PROJECT_DIR"
    echo "  source $VENV_PATH/bin/activate"
    echo "  pip install gunicorn"
    exit 1
fi
echo "✓ Gunicorn найден: $GUNICORN_PATH"

# Проверяем gunicorn_config.py
if [ -f "$PROJECT_DIR/nginx/gunicorn_config.py" ]; then
    CONFIG_PATH="$PROJECT_DIR/nginx/gunicorn_config.py"
elif [ -f "$PROJECT_DIR/gunicorn_config.py" ]; then
    CONFIG_PATH="$PROJECT_DIR/gunicorn_config.py"
else
    echo "⚠ Внимание: gunicorn_config.py не найден, создайте его"
    CONFIG_PATH="$PROJECT_DIR/nginx/gunicorn_config.py"
fi
echo "✓ Конфигурация: $CONFIG_PATH"

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
WorkingDirectory=$PROJECT_DIR
Environment=\"PATH=$VENV_PATH/bin\"
Environment=\"DJANGO_SETTINGS_MODULE=content_api.settings\"
ExecStart=$GUNICORN_PATH \\
    --config $CONFIG_PATH \\
    content_api.wsgi:application
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
echo "Запуск сервиса..."
sudo systemctl start aplus-django

# Ждем немного
sleep 2

# Проверяем статус
echo ""
echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
sudo systemctl status aplus-django --no-pager -l

echo ""
echo "Если есть ошибки, проверьте логи:"
echo "  sudo journalctl -u aplus-django -n 50 --no-pager"
echo ""





