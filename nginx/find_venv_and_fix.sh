#!/bin/bash
# Найти реальный путь к venv и исправить сервис
# Выполните на сервере: bash find_venv_and_fix.sh

echo "=========================================="
echo "  ПОИСК VENV И ИСПРАВЛЕНИЕ СЕРВИСА"
echo "=========================================="
echo ""

# Текущая директория
CURRENT_DIR=$(pwd)
echo "Текущая директория: $CURRENT_DIR"
echo ""

# Проверяем, где находится активированный venv
if [ -n "$VIRTUAL_ENV" ]; then
    VENV_PATH="$VIRTUAL_ENV"
    echo "✓ Найден активированный venv: $VENV_PATH"
else
    echo "⚠ VIRTUAL_ENV не установлен"
    # Ищем venv в текущей директории и родительских
    if [ -d "$CURRENT_DIR/venv" ]; then
        VENV_PATH="$CURRENT_DIR/venv"
    elif [ -d "$CURRENT_DIR/.venv" ]; then
        VENV_PATH="$CURRENT_DIR/.venv"
    elif [ -d "$(dirname $CURRENT_DIR)/venv" ]; then
        VENV_PATH="$(dirname $CURRENT_DIR)/venv"
    else
        echo "❌ Не могу найти venv!"
        echo "Поиск в системе..."
        find /var/www -name "venv" -type d 2>/dev/null | head -5
        find /var/www -name ".venv" -type d 2>/dev/null | head -5
        exit 1
    fi
    echo "✓ Найден venv: $VENV_PATH"
fi

# Проверяем gunicorn
GUNICORN_PATH="$VENV_PATH/bin/gunicorn"
if [ -f "$GUNICORN_PATH" ]; then
    echo "✓ Gunicorn найден: $GUNICORN_PATH"
else
    echo "❌ Gunicorn не найден в $GUNICORN_PATH"
    echo "Установите gunicorn:"
    echo "  source $VENV_PATH/bin/activate"
    echo "  pip install gunicorn"
    exit 1
fi

# Определяем рабочую директорию (где находится manage.py)
if [ -f "$CURRENT_DIR/manage.py" ]; then
    WORK_DIR="$CURRENT_DIR"
elif [ -f "$(dirname $CURRENT_DIR)/manage.py" ]; then
    WORK_DIR="$(dirname $CURRENT_DIR)"
else
    echo "❌ Не могу найти manage.py!"
    exit 1
fi

echo "✓ Рабочая директория: $WORK_DIR"
echo ""

# Проверяем gunicorn_config.py
if [ -f "$WORK_DIR/nginx/gunicorn_config.py" ]; then
    CONFIG_PATH="$WORK_DIR/nginx/gunicorn_config.py"
elif [ -f "$WORK_DIR/gunicorn_config.py" ]; then
    CONFIG_PATH="$WORK_DIR/gunicorn_config.py"
else
    echo "⚠ gunicorn_config.py не найден, будет использован без конфига"
    CONFIG_PATH=""
fi

echo "✓ Конфигурация: ${CONFIG_PATH:-не используется}"
echo ""

# Создаем сервис
echo "Создание файла сервиса..."
if [ -n "$CONFIG_PATH" ]; then
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
echo "Перезагрузка systemd..."
sudo systemctl daemon-reload

# Останавливаем старый сервис
echo "Остановка старого сервиса..."
sudo systemctl stop aplus-django 2>/dev/null || true

# Запускаем новый
echo "Запуск сервиса..."
sudo systemctl start aplus-django

# Ждем
sleep 2

# Проверяем статус
echo ""
echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
sudo systemctl status aplus-django --no-pager -l

echo ""
echo "Если есть ошибки:"
echo "  sudo journalctl -u aplus-django -n 50 --no-pager"
echo ""





