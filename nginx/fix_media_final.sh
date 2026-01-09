#!/bin/bash
# Финальное исправление медиа файлов
# Выполните на сервере: bash fix_media_final.sh

set -e

echo "=========================================="
echo "  ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ МЕДИА"
echo "=========================================="
echo ""

NGINX_CONF="/etc/nginx/sites-available/aplus"
CORRECT_PATH="/var/www/aplus/finalA-/content_api/media/"

# 1. Создаем резервную копию
sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

# 2. Исправляем путь (добавляем finalA-)
echo "1. Исправление пути к медиа..."
sudo sed -i "s|alias /var/www/aplus/content_api/media/;|alias $CORRECT_PATH;|g" "$NGINX_CONF"
sudo sed -i "s|alias /var/www/aplus/content_api/staticfiles/;|alias /var/www/aplus/finalA-/content_api/staticfiles/;|g" "$NGINX_CONF"
echo "✓ Путь исправлен"
echo ""

# 3. Удаляем дублирование секции /media/
echo "2. Проверка на дублирование..."
# Используем Python для более точной обработки
sudo python3 << PYEOF
import re

with open('$NGINX_CONF', 'r') as f:
    content = f.read()

# Находим все секции location /media/
matches = list(re.finditer(r'location /media/ \{[^}]*\}', content, re.DOTALL))

if len(matches) > 1:
    print(f"Найдено {len(matches)} дублирующихся секций, оставляю первую...")
    # Оставляем только первую секцию
    first_match = matches[0]
    # Удаляем остальные
    for match in reversed(matches[1:]):
        content = content[:match.start()] + content[match.end():]
    
    with open('$NGINX_CONF', 'w') as f:
        f.write(content)
    print("✓ Дублирование удалено")
else:
    print("✓ Дублирования нет")
PYEOF

echo ""

# 4. Проверяем конфигурацию
echo "3. Проверка конфигурации..."
grep -A 3 "location /media/" "$NGINX_CONF"
echo ""

# 5. Проверяем синтаксис
echo "4. Проверка синтаксиса Nginx..."
if sudo nginx -t; then
    echo "✓ Синтаксис корректен"
    sudo systemctl restart nginx
    echo "✓ Nginx перезапущен"
else
    echo "❌ Ошибка синтаксиса!"
    exit 1
fi
echo ""

# 6. Тестируем доступность
echo "5. Тестирование доступа..."
TEST_FILE=$(ls /var/www/aplus/finalA-/content_api/media/swiper/ 2>/dev/null | head -1)
if [ -n "$TEST_FILE" ]; then
    echo "Тестовый файл: swiper/$TEST_FILE"
    echo "Проверка через Nginx (с таймаутом)..."
    
    timeout 5 curl -k -s -o /dev/null -w "HTTP: %{http_code}\n" "https://aplus.tj/media/swiper/$TEST_FILE" 2>&1 || echo "Таймаут или ошибка"
else
    echo "⚠ Тестовый файл не найден"
fi
echo ""

# 7. Проверяем API
echo "6. Проверка API..."
echo "----------------------------------------"
API_RESPONSE=$(timeout 5 curl -k -s "https://aplus.tj/api/homepage/api/swiper-items/" 2>&1 || echo "ERROR")
if echo "$API_RESPONSE" | grep -q "{" || echo "$API_RESPONSE" | grep -q "\["; then
    echo "✓ API возвращает JSON"
    echo "Пример ответа (первые 200 символов):"
    echo "$API_RESPONSE" | head -c 200
    echo "..."
else
    echo "⚠ API не возвращает JSON или ошибка"
    echo "Ответ: $API_RESPONSE"
fi
echo ""

echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте в браузере:"
echo "  1. Откройте https://aplus.tj"
echo "  2. Нажмите F12 → Network tab"
echo "  3. Обновите страницу"
echo "  4. Найдите запросы к /media/ и проверьте их статус"
echo ""



