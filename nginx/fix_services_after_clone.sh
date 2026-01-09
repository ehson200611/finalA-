#!/bin/bash
# Исправление сервисов после клонирования
# Выполните на сервере: bash fix_services_after_clone.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ СЕРВИСОВ"
echo "=========================================="
echo ""

# 1. Исправляем Django - устанавливаем gunicorn
echo "1. Установка gunicorn для Django..."
cd "$PROJECT_DIR/content_api"
source venv/bin/activate
pip install gunicorn
echo "✓ Gunicorn установлен"
echo ""

# 2. Исправляем Next.js - устанавливаем зависимости и собираем
echo "2. Установка npm зависимостей для Next.js..."
cd "$PROJECT_DIR/frontenda/Learning-center-A-Client"

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
    echo "Установка npm зависимостей..."
    npm install
    echo "✓ Зависимости установлены"
else
    echo "✓ Зависимости уже установлены"
fi
echo ""

# Собираем проект
echo "3. Сборка Next.js проекта..."
npm run build
echo "✓ Проект собран"
echo ""

# 3. Перезапускаем сервисы
echo "4. Перезапуск сервисов..."
sudo systemctl restart aplus-django
sleep 2
sudo systemctl restart aplus-nextjs
sleep 2
echo "✓ Сервисы перезапущены"
echo ""

# 4. Проверяем статус
echo "5. Проверка статуса сервисов..."
echo ""
echo "=== Django ==="
sudo systemctl status aplus-django --no-pager -l | head -10
echo ""
echo "=== Next.js ==="
sudo systemctl status aplus-nextjs --no-pager -l | head -10
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

