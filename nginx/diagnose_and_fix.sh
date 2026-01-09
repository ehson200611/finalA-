#!/bin/bash
# Скрипт для диагностики и исправления проблем с Django сервисом
# Выполните на сервере: bash diagnose_and_fix.sh

echo "=========================================="
echo "  ДИАГНОСТИКА ПРОБЛЕМ С DJANGO СЕРВИСОМ"
echo "=========================================="
echo ""

# Определяем путь к проекту
if [ -f "/root/finalA-/manage.py" ]; then
    PROJECT_DIR="/root/finalA-"
elif [ -f "/var/www/aplus/manage.py" ]; then
    PROJECT_DIR="/var/www/aplus"
else
    echo "❌ Ошибка: Не могу найти manage.py"
    echo "Проверьте, где находится ваш проект"
    exit 1
fi

echo "✓ Найден проект в: $PROJECT_DIR"
echo ""

# Проверяем структуру
echo "Проверка структуры проекта:"
echo "----------------------------------------"
ls -la "$PROJECT_DIR" | head -20
echo ""

# Проверяем venv
if [ -d "$PROJECT_DIR/venv" ]; then
    VENV_PATH="$PROJECT_DIR/venv"
    echo "✓ Найден venv в: $VENV_PATH"
elif [ -d "$PROJECT_DIR/.venv" ]; then
    VENV_PATH="$PROJECT_DIR/.venv"
    echo "✓ Найден venv в: $VENV_PATH"
else
    echo "❌ Ошибка: venv не найден!"
    exit 1
fi

# Проверяем gunicorn
GUNICORN_PATH="$VENV_PATH/bin/gunicorn"
if [ -f "$GUNICORN_PATH" ]; then
    echo "✓ Gunicorn найден: $GUNICORN_PATH"
else
    echo "❌ Ошибка: Gunicorn не найден в $GUNICORN_PATH"
    echo "Установите gunicorn:"
    echo "  cd $PROJECT_DIR"
    echo "  source $VENV_PATH/bin/activate"
    echo "  pip install gunicorn"
    exit 1
fi

# Проверяем gunicorn_config.py
if [ -f "$PROJECT_DIR/nginx/gunicorn_config.py" ]; then
    CONFIG_PATH="$PROJECT_DIR/nginx/gunicorn_config.py"
    echo "✓ Конфигурация найдена: $CONFIG_PATH"
elif [ -f "$PROJECT_DIR/gunicorn_config.py" ]; then
    CONFIG_PATH="$PROJECT_DIR/gunicorn_config.py"
    echo "✓ Конфигурация найдена: $CONFIG_PATH"
else
    echo "⚠ Внимание: gunicorn_config.py не найден"
    CONFIG_PATH="$PROJECT_DIR/nginx/gunicorn_config.py"
    echo "Создайте его или скопируйте из nginx/"
fi

# Проверяем manage.py
if [ -f "$PROJECT_DIR/manage.py" ]; then
    echo "✓ manage.py найден"
else
    echo "❌ Ошибка: manage.py не найден!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  СОЗДАНИЕ ПРАВИЛЬНОГО СЕРВИСА"
echo "=========================================="
echo ""

# Создаем правильный файл сервиса
SERVICE_FILE="/tmp/aplus-django.service"
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=A+ Learning Center Django Application
After=network.target

[Service]
Type=notify
User=root
Group=root
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_PATH/bin"
Environment="DJANGO_SETTINGS_MODULE=content_api.settings"
ExecStart=$GUNICORN_PATH \\
    --config $CONFIG_PATH \\
    content_api.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-django

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Файл сервиса создан"
echo ""
echo "Содержимое:"
echo "----------------------------------------"
cat "$SERVICE_FILE"
echo "----------------------------------------"
echo ""

# Копируем в systemd
echo "Копирование в /etc/systemd/system/..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/aplus-django.service

# Перезагружаем systemd
echo "Перезагрузка systemd..."
sudo systemctl daemon-reload

# Останавливаем старый сервис
echo "Остановка старого сервиса..."
sudo systemctl stop aplus-django 2>/dev/null || true

# Запускаем новый
echo "Запуск сервиса..."
sudo systemctl start aplus-django

# Проверяем статус
echo ""
echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
sleep 2
sudo systemctl status aplus-django --no-pager -l

echo ""
echo "Если сервис не запустился, проверьте логи:"
echo "  sudo journalctl -u aplus-django -n 50 --no-pager"
echo ""





