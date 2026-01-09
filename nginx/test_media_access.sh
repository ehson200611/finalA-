#!/bin/bash
# Тестирование доступа к медиа файлам
# Выполните на сервере: bash test_media_access.sh

echo "=========================================="
echo "  ТЕСТИРОВАНИЕ ДОСТУПА К МЕДИА ФАЙЛАМ"
echo "=========================================="
echo ""

MEDIA_DIR="/var/www/aplus/finalA-/content_api/media"
NGINX_CONF="/etc/nginx/sites-available/aplus"

# 1. Проверяем конфигурацию Nginx
echo "1. Проверка конфигурации Nginx для /media/:"
echo "----------------------------------------"
grep -A 5 "location /media/" "$NGINX_CONF" || echo "⚠ Секция /media/ не найдена!"
echo ""

# 2. Проверяем существование файлов
echo "2. Проверка медиа файлов:"
echo "----------------------------------------"
if [ -d "$MEDIA_DIR/swiper" ]; then
    echo "✓ swiper директория существует"
    ls "$MEDIA_DIR/swiper" | head -3
    echo ""
    
    # Берем первый файл для теста
    TEST_FILE=$(ls "$MEDIA_DIR/swiper" | head -1)
    if [ -n "$TEST_FILE" ]; then
        echo "Тестовый файл: $TEST_FILE"
        echo "Полный путь: $MEDIA_DIR/swiper/$TEST_FILE"
        echo ""
        
        # Проверяем доступность через Nginx
        echo "3. Тест доступа через Nginx:"
        echo "----------------------------------------"
        echo "Тест: https://aplus.tj/media/swiper/$TEST_FILE"
        HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" "https://aplus.tj/media/swiper/$TEST_FILE" 2>&1 || echo "000")
        echo "HTTP код: $HTTP_CODE"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✓ Файл доступен!"
        elif [ "$HTTP_CODE" = "404" ]; then
            echo "❌ 404 - файл не найден через Nginx"
            echo "Проверьте конфигурацию Nginx"
        elif [ "$HTTP_CODE" = "403" ]; then
            echo "⚠ 403 - доступ запрещен"
            echo "Проверьте права доступа"
        else
            echo "⚠ Неожиданный код: $HTTP_CODE"
        fi
    fi
else
    echo "⚠ swiper директория не найдена"
fi
echo ""

# 4. Проверяем другие директории
echo "4. Проверка других медиа директорий:"
echo "----------------------------------------"
for dir in teachers books courses partners gallery; do
    if [ -d "$MEDIA_DIR/$dir" ]; then
        FILE_COUNT=$(find "$MEDIA_DIR/$dir" -type f | wc -l)
        echo "✓ $dir: $FILE_COUNT файлов"
    fi
done
echo ""

# 5. Проверяем логи Nginx
echo "5. Последние ошибки Nginx:"
echo "----------------------------------------"
sudo tail -10 /var/log/nginx/aplus_error.log 2>/dev/null | grep -i media || echo "Нет ошибок связанных с media"
echo ""

# 6. Проверяем права доступа
echo "6. Права доступа:"
echo "----------------------------------------"
ls -ld "$MEDIA_DIR"
ls -ld "$MEDIA_DIR/swiper" 2>/dev/null || echo "swiper не найден"
echo ""

echo "=========================================="
echo "  РЕКОМЕНДАЦИИ"
echo "=========================================="
echo ""
echo "Если файлы не доступны:"
echo "  1. Проверьте конфигурацию: grep -A 5 'location /media/' $NGINX_CONF"
echo "  2. Проверьте логи: sudo tail -20 /var/log/nginx/aplus_error.log"
echo "  3. Проверьте права: ls -la $MEDIA_DIR"
echo "  4. Убедитесь, что путь в Nginx правильный:"
echo "     alias /var/www/aplus/finalA-/content_api/media/;"
echo ""



