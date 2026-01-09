#!/bin/bash
# Запуск production сервисов
# Выполните на сервере: bash start_production_services.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"

echo "=========================================="
echo "  ЗАПУСК PRODUCTION СЕРВИСОВ"
echo "=========================================="
echo ""

# 1. Останавливаем все процессы на портах 3000 и 3001
echo "1. Остановка старых процессов..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2
echo "✓ Процессы остановлены"
echo ""

# 2. Проверяем, что проект собран
echo "2. Проверка сборки проекта..."
cd "$PROJECT_DIR/frontenda/Learning-center-A-Client"

if [ ! -d ".next" ]; then
    echo "⚠ Проект не собран, запускаю сборку..."
    yarn build
else
    echo "✓ Проект уже собран"
fi
echo ""

# 3. Проверяем и исправляем systemd сервис для Next.js
echo "3. Проверка systemd сервиса для Next.js..."
if [ -f "/etc/systemd/system/aplus-nextjs.service" ]; then
    # Обновляем путь к next в сервисе
    sudo sed -i 's|/usr/bin/node.*next start|/usr/bin/node /var/www/aplus/finalA-/frontenda/Learning-center-A-Client/node_modules/.bin/next start|g' /etc/systemd/system/aplus-nextjs.service
    
    # Или используем npx
    sudo sed -i 's|ExecStart=.*|ExecStart=/usr/bin/npx next start|g' /etc/systemd/system/aplus-nextjs.service
    
    # Устанавливаем правильную рабочую директорию
    sudo sed -i "s|WorkingDirectory=.*|WorkingDirectory=$PROJECT_DIR/frontenda/Learning-center-A-Client|g" /etc/systemd/system/aplus-nextjs.service
    
    sudo systemctl daemon-reload
    echo "✓ Сервис обновлен"
else
    echo "⚠ Сервис не найден, создаю..."
    sudo tee /etc/systemd/system/aplus-nextjs.service > /dev/null <<EOF
[Unit]
Description=A+ Learning Center Next.js Application
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=$PROJECT_DIR/frontenda/Learning-center-A-Client
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="NEXT_PUBLIC_API_URL=https://aplus.tj"
ExecStart=/usr/bin/npx next start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-nextjs

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    echo "✓ Сервис создан"
fi
echo ""

# 4. Запускаем Django сервис
echo "4. Запуск Django сервиса..."
sudo systemctl restart aplus-django
sleep 2

# Проверяем статус Django
if sudo systemctl is-active --quiet aplus-django; then
    echo "✓ Django запущен"
else
    echo "⚠ Django не запустился, проверьте логи:"
    sudo journalctl -u aplus-django -n 20 --no-pager
fi
echo ""

# 5. Запускаем Next.js сервис
echo "5. Запуск Next.js сервиса..."
sudo systemctl restart aplus-nextjs
sleep 3

# Проверяем статус Next.js
if sudo systemctl is-active --quiet aplus-nextjs; then
    echo "✓ Next.js запущен"
else
    echo "⚠ Next.js не запустился, проверьте логи:"
    sudo journalctl -u aplus-nextjs -n 20 --no-pager
fi
echo ""

# 6. Проверяем статус всех сервисов
echo "6. Статус всех сервисов:"
echo ""
echo "=== Django ==="
sudo systemctl status aplus-django --no-pager -l | head -10
echo ""
echo "=== Next.js ==="
sudo systemctl status aplus-nextjs --no-pager -l | head -10
echo ""
echo "=== Nginx ==="
sudo systemctl status nginx --no-pager -l | head -5
echo ""

# 7. Проверяем, что порты слушаются
echo "7. Проверка портов:"
if netstat -tuln | grep -q ":8000"; then
    echo "✓ Django слушает порт 8000"
else
    echo "⚠ Django не слушает порт 8000"
fi

if netstat -tuln | grep -q ":3000"; then
    echo "✓ Next.js слушает порт 3000"
else
    echo "⚠ Next.js не слушает порт 3000"
fi
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""
echo "Если есть проблемы, проверьте логи:"
echo "  sudo journalctl -u aplus-django -f"
echo "  sudo journalctl -u aplus-nextjs -f"
echo ""


