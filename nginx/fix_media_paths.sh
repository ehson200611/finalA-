#!/bin/bash
# Исправление путей к медиа и статическим файлам в Nginx
# Выполните на сервере: bash fix_media_paths.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ ПУТЕЙ К МЕДИА ФАЙЛАМ"
echo "=========================================="
echo ""

NGINX_CONF="/etc/nginx/sites-available/aplus"
PROJECT_DIR="/var/www/aplus/finalA-"

echo "Обновление путей в Nginx конфигурации..."
echo ""

# Создаем резервную копию
sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

# Обновляем пути к статическим файлам
echo "1. Обновление пути к static файлам..."
sudo sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr/content_api/staticfiles/|$PROJECT_DIR/content_api/staticfiles/|g" "$NGINX_CONF"
echo "✓ Путь к static обновлен"

# Обновляем пути к медиа файлам
echo "2. Обновление пути к media файлам..."
sudo sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr/content_api/media/|$PROJECT_DIR/content_api/media/|g" "$NGINX_CONF"
echo "✓ Путь к media обновлен"

# Проверяем, что директории существуют
echo ""
echo "3. Проверка существования директорий..."
if [ -d "$PROJECT_DIR/content_api/staticfiles" ]; then
    echo "✓ staticfiles существует"
    ls -la "$PROJECT_DIR/content_api/staticfiles" | head -5
else
    echo "⚠ staticfiles не найден, создаю..."
    mkdir -p "$PROJECT_DIR/content_api/staticfiles"
fi

if [ -d "$PROJECT_DIR/content_api/media" ]; then
    echo "✓ media существует"
    ls -la "$PROJECT_DIR/content_api/media" | head -5
else
    echo "⚠ media не найден, создаю..."
    mkdir -p "$PROJECT_DIR/content_api/media"
fi
echo ""

# Проверяем конфигурацию Nginx
echo "4. Проверка конфигурации Nginx..."
if sudo nginx -t; then
    echo "✓ Конфигурация корректна"
    echo "Перезапуск Nginx..."
    sudo systemctl restart nginx
    echo "✓ Nginx перезапущен"
else
    echo "❌ Ошибка в конфигурации!"
    sudo nginx -t
    exit 1
fi
echo ""

# Проверяем доступность медиа файлов
echo "5. Проверка доступности медиа файлов..."
echo "----------------------------------------"
echo "Тест /media/ через Nginx:"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://aplus.tj/media/ || echo "000")
echo "HTTP код: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "404" ]; then
    if [ "$HTTP_CODE" = "404" ]; then
        echo "⚠ 404 - медиа файлы не найдены, но путь работает"
        echo "Проверьте, что файлы загружены в $PROJECT_DIR/content_api/media/"
    else
        echo "✓ Медиа путь доступен"
    fi
else
    echo "❌ Проблема с доступом к медиа"
fi
echo ""

# Показываем примеры файлов в медиа
echo "6. Содержимое медиа директории:"
echo "----------------------------------------"
if [ -d "$PROJECT_DIR/content_api/media" ]; then
    find "$PROJECT_DIR/content_api/media" -type f | head -10
    echo ""
    echo "Всего файлов: $(find $PROJECT_DIR/content_api/media -type f | wc -l)"
else
    echo "⚠ Медиа директория пуста или не существует"
fi
echo ""

echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте в браузере:"
echo "  https://aplus.tj/media/ - должен показать список или 403/404"
echo ""
echo "Если файлы не показываются:"
echo "  1. Проверьте, что файлы загружены в $PROJECT_DIR/content_api/media/"
echo "  2. Проверьте права доступа: sudo chmod -R 755 $PROJECT_DIR/content_api/media"
echo "  3. Проверьте логи: sudo tail -20 /var/log/nginx/aplus_error.log"
echo ""



