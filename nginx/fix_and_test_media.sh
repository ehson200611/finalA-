#!/bin/bash
# Полное исправление и тестирование медиа файлов
# Выполните на сервере: bash fix_and_test_media.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ И ТЕСТИРОВАНИЕ МЕДИА"
echo "=========================================="
echo ""

NGINX_CONF="/etc/nginx/sites-available/aplus"
MEDIA_DIR="/var/www/aplus/finalA-/content_api/media"

# 1. Проверяем текущую конфигурацию
echo "1. Текущая конфигурация /media/:"
echo "----------------------------------------"
grep -A 3 "location /media/" "$NGINX_CONF" || echo "⚠ Секция не найдена"
echo ""

# 2. Обновляем пути
echo "2. Обновление путей..."
sudo sed -i "s|alias /home/ehson/Рабочий\\\\ стол/A+\\\\ pr/content_api/media/;|alias $MEDIA_DIR/;|g" "$NGINX_CONF"
sudo sed -i "s|alias /home/ehson/Рабочий\\\\ стол/A+\\\\ pr/content_api/staticfiles/;|alias /var/www/aplus/finalA-/content_api/staticfiles/;|g" "$NGINX_CONF"

echo "✓ Пути обновлены"
echo ""

# 3. Проверяем новую конфигурацию
echo "3. Новая конфигурация /media/:"
echo "----------------------------------------"
grep -A 3 "location /media/" "$NGINX_CONF"
echo ""

# 4. Проверяем синтаксис
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

# 5. Тестируем доступность
echo "5. Тестирование доступа к медиа файлам:"
echo "----------------------------------------"

# Находим тестовый файл
if [ -d "$MEDIA_DIR/swiper" ]; then
    TEST_FILE=$(ls "$MEDIA_DIR/swiper" 2>/dev/null | head -1)
    if [ -n "$TEST_FILE" ]; then
        echo "Тестовый файл: swiper/$TEST_FILE"
        echo "Проверка через Nginx..."
        
        HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" "https://aplus.tj/media/swiper/$TEST_FILE" 2>&1 || echo "000")
        echo "HTTP код: $HTTP_CODE"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✓ Файл доступен!"
        else
            echo "⚠ Проблема с доступом (код: $HTTP_CODE)"
            echo "Проверьте логи: sudo tail -20 /var/log/nginx/aplus_error.log"
        fi
    fi
fi

# Проверяем корневую директорию media
echo ""
echo "Проверка корневой директории /media/:"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" "https://aplus.tj/media/" 2>&1 || echo "000")
echo "HTTP код: $HTTP_CODE (403 или 404 - нормально для директории)"
echo ""

# 6. Показываем структуру медиа
echo "6. Структура медиа директории:"
echo "----------------------------------------"
for dir in swiper teachers books courses partners gallery blogs_media; do
    if [ -d "$MEDIA_DIR/$dir" ]; then
        COUNT=$(find "$MEDIA_DIR/$dir" -type f 2>/dev/null | wc -l)
        echo "  $dir/: $COUNT файлов"
    fi
done
echo ""

echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте в браузере:"
echo "  https://aplus.tj/media/swiper/имя_файла.png"
echo ""
echo "Если файлы не показываются в frontend:"
echo "  1. Откройте консоль браузера (F12)"
echo "  2. Проверьте ошибки в Network tab"
echo "  3. Убедитесь, что API возвращает правильные пути"
echo ""



