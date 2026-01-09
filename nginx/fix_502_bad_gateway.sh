#!/bin/bash
# Исправление ошибки 502 Bad Gateway
# Выполните на сервере: bash fix_502_bad_gateway.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ 502 BAD GATEWAY"
echo "=========================================="
echo ""

# 1. Создаем директорию для логов (если не существует)
echo "1. Создание директории для логов..."
sudo mkdir -p "$PROJECT_DIR/logs"
sudo chmod 755 "$PROJECT_DIR/logs"
sudo touch "$PROJECT_DIR/logs/gunicorn_error.log" "$PROJECT_DIR/logs/gunicorn_access.log"
sudo chmod 644 "$PROJECT_DIR/logs"/*.log
echo "✓ Логи настроены"
echo ""

# 2. Проверяем и запускаем Django
echo "2. Проверка и запуск Django..."
if sudo systemctl is-active --quiet aplus-django; then
    echo "✓ Django уже запущен"
else
    echo "Запуск Django..."
    sudo systemctl restart aplus-django
    sleep 3
    
    if sudo systemctl is-active --quiet aplus-django; then
        echo "✓ Django запущен"
    else
        echo "❌ Django не запустился"
        echo "Логи:"
        sudo journalctl -u aplus-django -n 20 --no-pager
        echo ""
        echo "Попробуйте запустить вручную:"
        echo "  cd $PROJECT_DIR/content_api"
        echo "  source venv/bin/activate"
        echo "  python -m gunicorn --config $PROJECT_DIR/nginx/gunicorn_config.py content_api.wsgi:application"
    fi
fi
echo ""

# 3. Проверяем порт Django (8000)
echo "3. Проверка порта Django (8000)..."
if netstat -tuln 2>/dev/null | grep -q ":8000" || ss -tuln 2>/dev/null | grep -q ":8000"; then
    echo "✓ Django слушает порт 8000"
else
    echo "⚠ Django не слушает порт 8000"
    echo "Проверяю процессы..."
    ps aux | grep gunicorn | grep -v grep || echo "Gunicorn не запущен"
fi
echo ""

# 4. Проверяем и запускаем Next.js
echo "4. Проверка и запуск Next.js..."
if sudo systemctl is-active --quiet aplus-nextjs; then
    echo "✓ Next.js уже запущен"
else
    echo "Запуск Next.js..."
    sudo systemctl restart aplus-nextjs
    sleep 5
    
    if sudo systemctl is-active --quiet aplus-nextjs; then
        echo "✓ Next.js запущен"
    else
        echo "❌ Next.js не запустился"
        echo "Логи:"
        sudo journalctl -u aplus-nextjs -n 20 --no-pager
        echo ""
        echo "Попробуйте запустить вручную:"
        echo "  cd $PROJECT_DIR/frontenda/Learning-center-A-Client"
        echo "  npx next start"
    fi
fi
echo ""

# 5. Проверяем порт Next.js (3000)
echo "5. Проверка порта Next.js (3000)..."
if netstat -tuln 2>/dev/null | grep -q ":3000" || ss -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✓ Next.js слушает порт 3000"
else
    echo "⚠ Next.js не слушает порт 3000"
    echo "Проверяю процессы..."
    ps aux | grep "next start" | grep -v grep || echo "Next.js не запущен"
fi
echo ""

# 6. Проверяем конфигурацию Nginx
echo "6. Проверка конфигурации Nginx..."
if [ -f "/etc/nginx/sites-available/aplus" ]; then
    echo "Конфигурация Nginx найдена"
    
    # Проверяем, что прокси настроен правильно
    if grep -q "proxy_pass.*127.0.0.1:3000" /etc/nginx/sites-available/aplus; then
        echo "✓ Прокси для Next.js настроен"
    else
        echo "⚠ Прокси для Next.js не найден в конфиге"
    fi
    
    if grep -q "proxy_pass.*127.0.0.1:8000" /etc/nginx/sites-available/aplus; then
        echo "✓ Прокси для Django настроен"
    else
        echo "⚠ Прокси для Django не найден в конфиге"
    fi
    
    # Проверяем синтаксис
    if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
        echo "✓ Синтаксис Nginx правильный"
    else
        echo "❌ Ошибка синтаксиса Nginx:"
        sudo nginx -t
    fi
else
    echo "❌ Конфигурация Nginx не найдена!"
fi
echo ""

# 7. Перезапускаем Nginx
echo "7. Перезапуск Nginx..."
sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    echo "✓ Nginx запущен"
else
    echo "❌ Nginx не запустился"
    sudo systemctl status nginx --no-pager -l | head -20
fi
echo ""

# 8. Тестируем подключения
echo "8. Тестирование подключений..."
echo "Тест Django (порт 8000):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:8000/ || echo "❌ Django не отвечает"
echo ""

echo "Тест Next.js (порт 3000):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1:3000/ || echo "❌ Next.js не отвечает"
echo ""

# 9. Финальный статус
echo "9. Финальный статус всех сервисов:"
echo ""
echo "=== Django ==="
sudo systemctl status aplus-django --no-pager -l | head -8
echo ""
echo "=== Next.js ==="
sudo systemctl status aplus-nextjs --no-pager -l | head -8
echo ""
echo "=== Nginx ==="
sudo systemctl status nginx --no-pager -l | head -5
echo ""

# 10. Показываем открытые порты
echo "10. Открытые порты:"
netstat -tuln 2>/dev/null | grep -E ":(3000|8000|80|443)" || ss -tuln 2>/dev/null | grep -E ":(3000|8000|80|443)"
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""
echo "Если проблема осталась, проверьте:"
echo "  1. sudo journalctl -u aplus-django -f"
echo "  2. sudo journalctl -u aplus-nextjs -f"
echo "  3. sudo tail -f /var/log/nginx/error.log"
echo ""

