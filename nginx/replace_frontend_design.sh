#!/bin/bash
# Скрипт для замены всего дизайна frontend
# Выполните на сервере: bash replace_frontend_design.sh

set -e

echo "=========================================="
echo "  ЗАМЕНА ДИЗАЙНА FRONTEND"
echo "=========================================="
echo ""

FRONTEND_DIR="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"
SOURCE_DIR="/var/www/aplus/finalA-/frontenda"

echo "Frontend директория: $FRONTEND_DIR"
echo ""

# Проверяем существование
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Ошибка: Frontend директория не найдена!"
    exit 1
fi

# 1. Останавливаем Next.js сервис
echo "1. Остановка Next.js сервиса..."
sudo systemctl stop aplus-nextjs 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
echo "✓ Сервис остановлен"
echo ""

# 2. Создаем резервную копию
echo "2. Создание резервной копии..."
BACKUP_DIR="/var/www/aplus/finalA-/frontenda_backup_$(date +%Y%m%d_%H%M%S)"
sudo cp -r "$FRONTEND_DIR" "$BACKUP_DIR"
echo "✓ Резервная копия создана: $BACKUP_DIR"
echo ""

# 3. Переходим в директорию frontend
cd "$FRONTEND_DIR"

# 4. Обновляем зависимости (если нужно)
echo "3. Проверка зависимостей..."
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
else
    echo "✓ node_modules существует"
fi
echo ""

# 5. Пересобираем проект
echo "4. Пересборка проекта с новым дизайном..."
npm run build
echo "✓ Проект пересобран"
echo ""

# 6. Перезапускаем сервисы
echo "5. Перезапуск сервисов..."
sudo systemctl start aplus-nextjs 2>/dev/null || echo "⚠ Next.js сервис не настроен, запустите вручную: npm start"
sudo systemctl restart nginx
echo "✓ Сервисы перезапущены"
echo ""

echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Дизайн frontend обновлен!"
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""
echo "Если нужно откатить изменения:"
echo "  sudo cp -r $BACKUP_DIR/* $FRONTEND_DIR/"
echo ""

