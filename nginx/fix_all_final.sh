#!/bin/bash
# Полное исправление: Django сервис + Nginx конфигурация
# Выполните на сервере: bash fix_all_final.sh

set -e

echo "=========================================="
echo "  ПОЛНОЕ ИСПРАВЛЕНИЕ DJANGO + NGINX"
echo "=========================================="
echo ""

WORK_DIR="/var/www/aplus/finalA-"
VENV_PATH="/var/www/aplus/finalA-/content_api/venv"
PYTHON_PATH="$VENV_PATH/bin/python"
CONFIG_PATH="/var/www/aplus/finalA-/nginx/gunicorn_config.py"

echo "Рабочая директория: $WORK_DIR"
echo "Python: $PYTHON_PATH"
echo ""

# Проверяем Python
if [ ! -f "$PYTHON_PATH" ]; then
    echo "❌ Ошибка: Python не найден в $PYTHON_PATH"
    exit 1
fi
echo "✓ Python найден: $PYTHON_PATH"

# Проверяем gunicorn в venv
if ! $PYTHON_PATH -m gunicorn --version > /dev/null 2>&1; then
    echo "❌ Ошибка: Gunicorn не установлен в venv"
    echo "Установите: cd $WORK_DIR/content_api && source $VENV_PATH/bin/activate && pip install gunicorn"
    exit 1
fi
echo "✓ Gunicorn доступен через Python"

# Создаем сервис с использованием python -m gunicorn
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

# Ждем
sleep 3

# Проверяем статус
echo ""
echo "=========================================="
echo "  СТАТУС DJANGO СЕРВИСА"
echo "=========================================="
echo ""
sudo systemctl status aplus-django --no-pager -l

# Проверяем, что Django отвечает
echo ""
echo "Проверка Django (должен вернуть ответ):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:8000/api/ || echo "Django не отвечает на порту 8000"

# Исправляем пути в Nginx
echo ""
echo "=========================================="
echo "  ИСПРАВЛЕНИЕ NGINX КОНФИГУРАЦИИ"
echo "=========================================="
echo ""

NGINX_CONF="/etc/nginx/sites-available/aplus"
if [ -f "$NGINX_CONF" ]; then
    echo "Обновление путей в Nginx конфигурации..."
    sudo sed -i 's|/home/ehson/Рабочий\\ стол/A+\\ pr|/var/www/aplus/finalA-|g' "$NGINX_CONF"
    echo "✓ Пути обновлены"
    
    # Проверяем конфигурацию
    echo "Проверка конфигурации Nginx..."
    if sudo nginx -t; then
        echo "✓ Конфигурация Nginx корректна"
        echo "Перезапуск Nginx..."
        sudo systemctl restart nginx
        echo "✓ Nginx перезапущен"
    else
        echo "❌ Ошибка в конфигурации Nginx!"
    fi
else
    echo "⚠ Файл $NGINX_CONF не найден"
fi

echo ""
echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
echo "Проверьте:"
echo "  1. Django сервис: sudo systemctl status aplus-django"
echo "  2. Nginx: sudo systemctl status nginx"
echo "  3. Django API: curl http://127.0.0.1:8000/api/"
echo "  4. Сайт: curl -k -I https://aplus.tj"
echo ""
echo "Если Django не запустился, проверьте логи:"
echo "  sudo journalctl -u aplus-django -n 50 --no-pager"
echo ""




