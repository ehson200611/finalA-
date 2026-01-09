#!/bin/bash
# Исправление Django сервиса
# Выполните на сервере: bash fix_django_service.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"
DJANGO_DIR="$PROJECT_DIR/content_api"

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ DJANGO СЕРВИСА"
echo "=========================================="
echo ""

# 1. Проверяем логи
echo "1. Проверка логов Django..."
echo "Последние ошибки:"
sudo journalctl -u aplus-django -n 30 --no-pager | tail -20
echo ""

# 2. Проверяем конфигурацию сервиса
echo "2. Проверка конфигурации сервиса..."
if [ -f "/etc/systemd/system/aplus-django.service" ]; then
    echo "Текущая конфигурация:"
    cat /etc/systemd/system/aplus-django.service
    echo ""
else
    echo "❌ Файл сервиса не найден!"
    exit 1
fi

# 3. Проверяем пути
echo "3. Проверка путей..."
echo "Django директория: $DJANGO_DIR"
if [ ! -d "$DJANGO_DIR" ]; then
    echo "❌ Django директория не найдена!"
    exit 1
fi

echo "Venv путь: $DJANGO_DIR/venv"
if [ ! -d "$DJANGO_DIR/venv" ]; then
    echo "⚠ Venv не найден, создаю..."
    cd "$DJANGO_DIR"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

echo "Gunicorn:"
if [ -f "$DJANGO_DIR/venv/bin/gunicorn" ]; then
    echo "✓ Gunicorn найден"
else
    echo "⚠ Gunicorn не найден, устанавливаю..."
    cd "$DJANGO_DIR"
    source venv/bin/activate
    pip install gunicorn
fi

echo "Gunicorn config:"
if [ -f "$PROJECT_DIR/nginx/gunicorn_config.py" ]; then
    echo "✓ Gunicorn config найден"
else
    echo "⚠ Gunicorn config не найден"
fi

echo "WSGI:"
if [ -f "$DJANGO_DIR/content_api/wsgi.py" ]; then
    echo "✓ WSGI найден: content_api/wsgi.py"
elif [ -f "$DJANGO_DIR/content_api/content_api/wsgi.py" ]; then
    echo "✓ WSGI найден: content_api/content_api/wsgi.py"
else
    echo "❌ WSGI не найден!"
    find "$DJANGO_DIR" -name "wsgi.py" 2>/dev/null || echo "WSGI файл не найден"
fi
echo ""

# 4. Исправляем сервис
echo "4. Исправление сервиса..."

# Находим правильный путь к wsgi
WSGI_PATH="content_api.wsgi:application"
if [ -f "$DJANGO_DIR/content_api/content_api/wsgi.py" ]; then
    WSGI_PATH="content_api.content_api.wsgi:application"
fi

# Создаем правильный сервис
sudo tee /etc/systemd/system/aplus-django.service > /dev/null <<EOF
[Unit]
Description=A+ Learning Center Django Application
After=network.target

[Service]
Type=notify
User=root
Group=root
WorkingDirectory=$DJANGO_DIR
Environment="PATH=$DJANGO_DIR/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=content_api.settings"
ExecStart=$DJANGO_DIR/venv/bin/python -m gunicorn \\
    --config $PROJECT_DIR/nginx/gunicorn_config.py \\
    $WSGI_PATH
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-django

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Сервис обновлен"
echo ""

# 5. Перезагружаем systemd
echo "5. Перезагрузка systemd..."
sudo systemctl daemon-reload
echo "✓ Systemd перезагружен"
echo ""

# 6. Проверяем синтаксис сервиса
echo "6. Проверка синтаксиса сервиса..."
sudo systemctl cat aplus-django.service > /dev/null && echo "✓ Синтаксис правильный" || echo "❌ Ошибка синтаксиса"
echo ""

# 7. Запускаем сервис
echo "7. Запуск Django сервиса..."
sudo systemctl restart aplus-django
sleep 3

if sudo systemctl is-active --quiet aplus-django; then
    echo "✓ Django запущен успешно!"
else
    echo "❌ Django не запустился"
    echo ""
    echo "Последние логи:"
    sudo journalctl -u aplus-django -n 30 --no-pager
    echo ""
    echo "Попробуйте запустить вручную для диагностики:"
    echo "  cd $DJANGO_DIR"
    echo "  source venv/bin/activate"
    echo "  python -m gunicorn --config $PROJECT_DIR/nginx/gunicorn_config.py $WSGI_PATH"
fi
echo ""

# 8. Статус
echo "8. Статус сервиса:"
sudo systemctl status aplus-django --no-pager -l | head -15
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""

