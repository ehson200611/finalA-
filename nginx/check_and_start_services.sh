#!/bin/bash
# Проверка и запуск сервисов
# Выполните на сервере: bash check_and_start_services.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"
NEXTJS_DIR="$PROJECT_DIR/frontenda/Learning-center-A-Client"

echo "=========================================="
echo "  ПРОВЕРКА И ЗАПУСК СЕРВИСОВ"
echo "=========================================="
echo ""

# 1. Проверяем, что Next.js собран
echo "1. Проверка сборки Next.js..."
cd "$NEXTJS_DIR"

if [ ! -d ".next" ]; then
    echo "⚠ Проект не собран, запускаю сборку..."
    yarn build
else
    echo "✓ Проект собран"
fi

# Проверяем наличие next
if [ ! -f "node_modules/.bin/next" ]; then
    echo "⚠ Next.js не найден в node_modules, проверяю..."
    ls -la node_modules/.bin/ | grep next || echo "❌ Next.js не установлен"
    exit 1
else
    echo "✓ Next.js найден"
fi
echo ""

# 2. Останавливаем все процессы Next.js
echo "2. Остановка старых процессов..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2
echo "✓ Процессы остановлены"
echo ""

# 3. Перезагружаем systemd
echo "3. Перезагрузка systemd..."
sudo systemctl daemon-reload
echo "✓ Systemd перезагружен"
echo ""

# 4. Запускаем Django
echo "4. Запуск Django сервиса..."
sudo systemctl restart aplus-django
sleep 3

if sudo systemctl is-active --quiet aplus-django; then
    echo "✓ Django запущен"
else
    echo "❌ Django не запустился"
    echo "Логи:"
    sudo journalctl -u aplus-django -n 10 --no-pager
fi
echo ""

# 5. Запускаем Next.js
echo "5. Запуск Next.js сервиса..."
sudo systemctl restart aplus-nextjs
sleep 5

if sudo systemctl is-active --quiet aplus-nextjs; then
    echo "✓ Next.js запущен"
else
    echo "❌ Next.js не запустился"
    echo "Логи:"
    sudo journalctl -u aplus-nextjs -n 20 --no-pager
    echo ""
    echo "Попробуйте запустить вручную для диагностики:"
    echo "  cd $NEXTJS_DIR"
    echo "  /usr/bin/node node_modules/.bin/next start"
fi
echo ""

# 6. Проверяем порты
echo "6. Проверка портов:"
if netstat -tuln 2>/dev/null | grep -q ":8000" || ss -tuln 2>/dev/null | grep -q ":8000"; then
    echo "✓ Порт 8000 (Django) слушается"
else
    echo "⚠ Порт 8000 не слушается"
fi

if netstat -tuln 2>/dev/null | grep -q ":3000" || ss -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✓ Порт 3000 (Next.js) слушается"
else
    echo "⚠ Порт 3000 не слушается"
fi
echo ""

# 7. Финальный статус
echo "7. Финальный статус сервисов:"
echo ""
echo "=== Django ==="
sudo systemctl status aplus-django --no-pager -l | head -12
echo ""
echo "=== Next.js ==="
sudo systemctl status aplus-nextjs --no-pager -l | head -12
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

