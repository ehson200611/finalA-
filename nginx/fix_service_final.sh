#!/bin/bash
# Финальный скрипт для исправления Django сервиса
# Выполните на сервере: bash fix_service_final.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ DJANGO СЕРВИСА"
echo "=========================================="
echo ""

# Правильные пути
WORK_DIR="/var/www/aplus/finalA-"
VENV_PATH="/var/www/aplus/finalA-/content_api/venv"
CONFIG_PATH="/var/www/aplus/finalA-/nginx/gunicorn_config.py"

echo "Рабочая директория: $WORK_DIR"
echo "Venv путь: $VENV_PATH"
echo "Конфигурация: $CONFIG_PATH"
echo ""

# Проверяем существование
if [ ! -d "$WORK_DIR" ]; then
    echo "❌ Ошибка: Рабочая директория не найдена: $WORK_DIR"
    exit 1
fi

if [ ! -d "$VENV_PATH" ]; then
    echo "⚠ Внимание: venv не найден в $VENV_PATH"
    echo "Проверяю альтернативный путь..."
    if [ -d "/var/www/aplus/finalA-/content_api/.venv" ]; then
        VENV_PATH="/var/www/aplus/finalA-/content_api/.venv"
        echo "✓ Найден альтернативный venv: $VENV_PATH"
    else
        echo "❌ Ошибка: venv не найден!"
        exit 1
    fi
fi

# Проверяем gunicorn
GUNICORN_PATH="$VENV_PATH/bin/gunicorn"
if [ ! -f "$GUNICORN_PATH" ]; then
    echo "❌ Ошибка: Gunicorn не найден в $GUNICORN_PATH"
    echo "Установите gunicorn:"
    echo "  cd $WORK_DIR/content_api"
    echo "  source $VENV_PATH/bin/activate"
    echo "  pip install gunicorn"
    exit 1
fi
echo "✓ Gunicorn найден: $GUNICORN_PATH"

# Проверяем manage.py
if [ ! -f "$WORK_DIR/manage.py" ]; then
    echo "❌ Ошибка: manage.py не найден в $WORK_DIR"
    exit 1
fi
echo "✓ manage.py найден"

# Проверяем конфигурацию
if [ ! -f "$CONFIG_PATH" ]; then
    echo "⚠ Внимание: gunicorn_config.py не найден, будет использован без конфига"
    USE_CONFIG=false
else
    echo "✓ Конфигурация найдена"
    USE_CONFIG=true
fi

echo ""
echo "=========================================="
echo "  СОЗДАНИЕ СЕРВИСА"
echo "=========================================="
echo ""

# Создаем файл сервиса
if [ "$USE_CONFIG" = true ]; then
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
else
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
ExecStart=$GUNICORN_PATH \\
    --bind 127.0.0.1:8000 \\
    --workers 3 \\
    --timeout 300 \\
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
fi

echo "✓ Файл сервиса создан"
echo ""

# Перезагружаем systemd
echo "Перезагрузка systemd daemon..."
sudo systemctl daemon-reload

# Останавливаем старый сервис
echo "Остановка старого сервиса..."
sudo systemctl stop aplus-django 2>/dev/null || true

# Ждем немного
sleep 1

# Запускаем новый сервис
echo "Запуск нового сервиса..."
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
echo "=========================================="
echo "  ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"
echo "=========================================="
echo ""
echo "Если сервис не запустился, проверьте логи:"
echo "  sudo journalctl -u aplus-django -n 50 --no-pager"
echo ""
echo "Проверьте, что Django отвечает:"
echo "  curl http://127.0.0.1:8000/api/"
echo ""
echo "Управление сервисом:"
echo "  sudo systemctl start aplus-django    # Запустить"
echo "  sudo systemctl stop aplus-django     # Остановить"
echo "  sudo systemctl restart aplus-django  # Перезапустить"
echo "  sudo systemctl status aplus-django   # Статус"
echo ""





