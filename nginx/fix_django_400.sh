#!/bin/bash
# Исправление проблем с Django (400 ошибка и запуск сервиса)
# Выполните на сервере: bash fix_django_400.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ DJANGO (400 ОШИБКА)"
echo "=========================================="
echo ""

WORK_DIR="/var/www/aplus/finalA-"
SETTINGS_FILE="$WORK_DIR/content_api/settings.py"

# 1. Проверяем логи Django
echo "1. Проверка логов Django сервиса..."
echo "----------------------------------------"
sudo journalctl -u aplus-django -n 30 --no-pager
echo ""

# 2. Проверяем ALLOWED_HOSTS
echo "2. Проверка ALLOWED_HOSTS в settings.py..."
echo "----------------------------------------"
if grep -q "ALLOWED_HOSTS" "$SETTINGS_FILE"; then
    echo "Текущие ALLOWED_HOSTS:"
    grep "ALLOWED_HOSTS" "$SETTINGS_FILE" | head -3
    echo ""
    echo "Обновление ALLOWED_HOSTS..."
    
    # Создаем резервную копию
    cp "$SETTINGS_FILE" "${SETTINGS_FILE}.backup"
    
    # Обновляем ALLOWED_HOSTS
    sed -i "s/ALLOWED_HOSTS = \[.*\]/ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', '89.23.100.163', '127.0.0.1', 'localhost']/" "$SETTINGS_FILE" || \
    sed -i "/^ALLOWED_HOSTS =/c\ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', '89.23.100.163', '127.0.0.1', 'localhost']" "$SETTINGS_FILE" || \
    echo "ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', '89.23.100.163', '127.0.0.1', 'localhost']" >> "$SETTINGS_FILE"
    
    echo "✓ ALLOWED_HOSTS обновлен"
else
    echo "⚠ ALLOWED_HOSTS не найден, добавляю..."
    echo "" >> "$SETTINGS_FILE"
    echo "ALLOWED_HOSTS = ['aplus.tj', 'www.aplus.tj', '89.23.100.163', '127.0.0.1', 'localhost']" >> "$SETTINGS_FILE"
    echo "✓ ALLOWED_HOSTS добавлен"
fi

# 3. Проверяем DEBUG
echo ""
echo "3. Проверка DEBUG..."
if grep -q "DEBUG = True" "$SETTINGS_FILE"; then
    echo "⚠ DEBUG = True, меняю на False..."
    sed -i 's/DEBUG = True/DEBUG = False/' "$SETTINGS_FILE"
    echo "✓ DEBUG установлен в False"
else
    echo "✓ DEBUG уже False или не найден"
fi

# 4. Проверяем, что Django может запуститься вручную
echo ""
echo "4. Проверка запуска Django вручную..."
cd "$WORK_DIR"
source content_api/venv/bin/activate

# Проверяем, что порт 8000 свободен
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠ Порт 8000 уже занят, останавливаю процесс..."
    sudo kill $(sudo lsof -t -i:8000) 2>/dev/null || true
    sleep 2
fi

# Пробуем запустить Django вручную (в фоне на 5 секунд)
echo "Тестовый запуск Django..."
timeout 5 python manage.py runserver 127.0.0.1:8000 > /tmp/django_test.log 2>&1 &
DJANGO_PID=$!
sleep 3
kill $DJANGO_PID 2>/dev/null || true

if grep -q "Starting development server" /tmp/django_test.log; then
    echo "✓ Django может запуститься"
else
    echo "❌ Ошибка при запуске Django:"
    cat /tmp/django_test.log
fi

# 5. Перезапускаем сервис
echo ""
echo "5. Перезапуск Django сервиса..."
sudo systemctl daemon-reload
sudo systemctl restart aplus-django
sleep 3

# 6. Проверяем статус
echo ""
echo "6. Статус сервиса:"
echo "----------------------------------------"
sudo systemctl status aplus-django --no-pager -l

# 7. Проверяем, что Django отвечает
echo ""
echo "7. Проверка ответа Django:"
echo "----------------------------------------"
sleep 2
if curl -s http://127.0.0.1:8000/api/ > /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/)
    echo "HTTP код ответа: $HTTP_CODE"
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "✓ Django отвечает (404 нормально, если эндпоинт не существует)"
    elif [ "$HTTP_CODE" = "400" ]; then
        echo "⚠ Все еще 400 - проверьте ALLOWED_HOSTS вручную"
        echo "Отредактируйте: nano $SETTINGS_FILE"
    else
        echo "HTTP код: $HTTP_CODE"
    fi
else
    echo "❌ Django не отвечает на порту 8000"
    echo "Проверьте логи: sudo journalctl -u aplus-django -n 50 --no-pager"
fi

echo ""
echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Если проблемы остались:"
echo "  1. Проверьте логи: sudo journalctl -u aplus-django -n 50 --no-pager"
echo "  2. Проверьте settings.py: nano $SETTINGS_FILE"
echo "  3. Убедитесь, что ALLOWED_HOSTS содержит все нужные домены"
echo ""




