#!/bin/bash
# Исправление проблемы с npm install (Bus error)
# Выполните на сервере: bash fix_npm_install.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ NPM УСТАНОВКИ"
echo "=========================================="
echo ""

cd "$PROJECT_DIR"

# 1. Очищаем кэш и удаляем node_modules
echo "1. Очистка кэша и удаление node_modules..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
echo "✓ Очистка завершена"
echo ""

# 2. Увеличиваем лимит памяти для Node.js
echo "2. Настройка переменных окружения..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
echo "✓ Переменные окружения установлены"
echo ""

# 3. Пробуем установить с разными флагами
echo "3. Установка зависимостей (попытка 1: с --legacy-peer-deps)..."
npm install --legacy-peer-deps --no-optional || {
    echo "⚠ Попытка 1 не удалась, пробуем другой способ..."
    echo ""
    
    echo "4. Установка зависимостей (попытка 2: без опциональных зависимостей)..."
    npm install --no-optional --ignore-scripts || {
        echo "⚠ Попытка 2 не удалась, пробуем третий способ..."
        echo ""
        
        echo "5. Установка зависимостей (попытка 3: пошаговая установка)..."
        # Устанавливаем основные зависимости без опциональных
        npm install --no-optional --ignore-scripts next react react-dom
        npm install --no-optional --ignore-scripts
    }
}

echo ""
echo "✓ Зависимости установлены"
echo ""

# 4. Проверяем, что next установлен
if [ -f "node_modules/.bin/next" ]; then
    echo "✓ Next.js найден"
else
    echo "⚠ Next.js не найден, пробуем установить напрямую..."
    npm install next --save --legacy-peer-deps
fi
echo ""

# 5. Собираем проект
echo "6. Сборка Next.js проекта..."
npm run build
echo "✓ Проект собран"
echo ""

# 6. Перезапускаем сервис
echo "7. Перезапуск Next.js сервиса..."
sudo systemctl restart aplus-nextjs
sleep 2

# 7. Проверяем статус
echo ""
echo "Статус Next.js сервиса:"
sudo systemctl status aplus-nextjs --no-pager -l | head -15

echo ""
echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""

