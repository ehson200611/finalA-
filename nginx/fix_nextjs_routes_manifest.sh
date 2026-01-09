#!/bin/bash
# Исправление ошибки Next.js routesManifest
# Выполните на сервере: bash fix_nextjs_routes_manifest.sh

set -e

NEXTJS_DIR="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ NEXT.JS ROUTES MANIFEST"
echo "=========================================="
echo ""

cd "$NEXTJS_DIR"

# 1. Останавливаем Next.js сервис
echo "1. Остановка Next.js сервиса..."
sudo systemctl stop aplus-nextjs
pkill -f "next start" 2>/dev/null || true
sleep 2
echo "✓ Сервис остановлен"
echo ""

# 2. Удаляем поврежденную директорию .next
echo "2. Удаление поврежденной директории .next..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✓ Директория .next удалена"
else
    echo "⚠ Директория .next не найдена"
fi
echo ""

# 3. Удаляем лишние lockfiles (если есть)
echo "3. Очистка lockfiles..."
if [ -f "../package-lock.json" ]; then
    echo "⚠ Найден package-lock.json в родительской директории"
    # Не удаляем, просто предупреждаем
fi

if [ -f "yarn.lock" ] && [ -f "package-lock.json" ]; then
    echo "⚠ Найдены оба lockfile, оставляем yarn.lock"
    # Можно удалить package-lock.json если используется yarn
    # rm -f package-lock.json
fi
echo ""

# 4. Пересобираем проект
echo "4. Пересборка Next.js проекта..."
echo "Это может занять несколько минут..."

# Используем yarn если есть yarn.lock, иначе npm
if [ -f "yarn.lock" ]; then
    echo "Используется yarn..."
    yarn build
else
    echo "Используется npm..."
    npm run build
fi

if [ -d ".next" ]; then
    echo "✓ Проект успешно пересобран"
else
    echo "❌ Ошибка при сборке проекта"
    exit 1
fi
echo ""

# 5. Проверяем routes-manifest
echo "5. Проверка routes-manifest..."
if [ -f ".next/routes-manifest.json" ]; then
    echo "✓ routes-manifest.json найден"
    
    # Проверяем, что файл валидный JSON
    if python3 -m json.tool .next/routes-manifest.json > /dev/null 2>&1; then
        echo "✓ routes-manifest.json валидный"
    else
        echo "⚠ routes-manifest.json поврежден, но файл существует"
    fi
else
    echo "⚠ routes-manifest.json не найден"
fi
echo ""

# 6. Запускаем Next.js сервис
echo "6. Запуск Next.js сервиса..."
sudo systemctl restart aplus-nextjs
sleep 5

if sudo systemctl is-active --quiet aplus-nextjs; then
    echo "✓ Next.js запущен успешно!"
else
    echo "❌ Next.js не запустился"
    echo "Логи:"
    sudo journalctl -u aplus-nextjs -n 30 --no-pager
    echo ""
    echo "Попробуйте запустить вручную для диагностики:"
    echo "  cd $NEXTJS_DIR"
    echo "  npx next start"
fi
echo ""

# 7. Проверяем порт
echo "7. Проверка порта 3000..."
sleep 2
if ss -tuln 2>/dev/null | grep -q ":3000" || netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✓ Next.js слушает порт 3000"
else
    echo "⚠ Next.js не слушает порт 3000"
fi
echo ""

# 8. Тестируем подключение
echo "8. Тестирование подключения..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$HTTP_CODE" != "000" ] && [ "$HTTP_CODE" != "" ]; then
    echo "✓ Next.js отвечает (HTTP $HTTP_CODE)"
else
    echo "⚠ Next.js не отвечает"
fi
echo ""

# 9. Статус
echo "9. Статус сервиса:"
sudo systemctl status aplus-nextjs --no-pager -l | head -12
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

