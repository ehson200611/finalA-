#!/bin/bash
# Настройка и запуск Next.js frontend
# Выполните на сервере: bash setup_frontend.sh

set -e

echo "=========================================="
echo "  НАСТРОЙКА NEXT.JS FRONTEND"
echo "=========================================="
echo ""

FRONTEND_DIR="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"

# Проверяем существование директории
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Ошибка: Frontend директория не найдена: $FRONTEND_DIR"
    exit 1
fi

echo "Frontend директория: $FRONTEND_DIR"
echo ""

# Переходим в директорию frontend
cd "$FRONTEND_DIR"

# 1. Создаем .env.local с правильным API URL
echo "1. Настройка переменных окружения..."
echo "----------------------------------------"
if [ -f ".env.local" ]; then
    echo "⚠ .env.local уже существует, обновляю..."
    sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://aplus.tj|' .env.local || \
    echo "NEXT_PUBLIC_API_URL=https://aplus.tj" > .env.local
else
    echo "NEXT_PUBLIC_API_URL=https://aplus.tj" > .env.local
fi
echo "✓ .env.local создан/обновлен"
cat .env.local
echo ""

# 2. Устанавливаем зависимости (если нужно)
echo "2. Проверка зависимостей..."
echo "----------------------------------------"
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
    echo "✓ Зависимости установлены"
else
    echo "✓ node_modules существует"
fi
echo ""

# 3. Собираем проект
echo "3. Сборка Next.js проекта..."
echo "----------------------------------------"
npm run build
echo "✓ Проект собран"
echo ""

# 4. Проверяем, что .next директория создана
echo "4. Проверка результата сборки..."
echo "----------------------------------------"
if [ -d ".next" ]; then
    echo "✓ .next директория создана"
    ls -la .next | head -10
else
    echo "❌ Ошибка: .next директория не создана!"
    exit 1
fi
echo ""

# 5. Обновляем пути в Nginx конфигурации
echo "5. Обновление путей в Nginx..."
echo "----------------------------------------"
NGINX_CONF="/etc/nginx/sites-available/aplus"
if [ -f "$NGINX_CONF" ]; then
    # Обновляем путь к .next
    sudo sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr/frontenda/Learning-center-A-Client/.next|$FRONTEND_DIR/.next|g" "$NGINX_CONF"
    
    # Проверяем конфигурацию
    if sudo nginx -t; then
        echo "✓ Конфигурация Nginx обновлена и корректна"
        echo "Перезапуск Nginx..."
        sudo systemctl restart nginx
        echo "✓ Nginx перезапущен"
    else
        echo "❌ Ошибка в конфигурации Nginx!"
        sudo nginx -t
        exit 1
    fi
else
    echo "⚠ Файл $NGINX_CONF не найден"
fi
echo ""

# 6. Финальная проверка
echo "6. Финальная проверка..."
echo "----------------------------------------"
echo "Проверка статуса Nginx:"
sudo systemctl status nginx --no-pager -l | head -10
echo ""

echo "Проверка доступности frontend:"
curl -k -s -o /dev/null -w "HTTP: %{http_code}\n" https://aplus.tj/ || echo "Не отвечает"
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Frontend настроен и готов к работе!"
echo ""
echo "Проверьте сайт в браузере:"
echo "  https://aplus.tj"
echo ""
echo "Если нужно пересобрать frontend после изменений:"
echo "  cd $FRONTEND_DIR"
echo "  npm run build"
echo "  sudo systemctl restart nginx"
echo ""




