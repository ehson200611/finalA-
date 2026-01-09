#!/bin/bash
# Настройка Next.js как systemd сервиса и обновление Nginx
# Выполните на сервере: bash setup_nextjs_service.sh

set -e

echo "=========================================="
echo "  НАСТРОЙКА NEXT.JS КАК СЕРВИСА"
echo "=========================================="
echo ""

FRONTEND_DIR="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"
NODE_PATH=$(which node)

echo "Frontend директория: $FRONTEND_DIR"
echo "Node путь: $NODE_PATH"
echo ""

# Проверяем существование
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Ошибка: Frontend директория не найдена"
    exit 1
fi

# 1. Останавливаем текущий процесс Next.js (если запущен)
echo "1. Остановка текущего процесса Next.js..."
pkill -f "next start" 2>/dev/null || true
sleep 2
echo "✓ Процесс остановлен"
echo ""

# 2. Создаем systemd сервис для Next.js
echo "2. Создание systemd сервиса для Next.js..."
sudo bash -c "cat > /etc/systemd/system/aplus-nextjs.service << EOF
[Unit]
Description=A+ Learning Center Next.js Application
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=$FRONTEND_DIR
Environment=\"NODE_ENV=production\"
Environment=\"PORT=3000\"
Environment=\"NEXT_PUBLIC_API_URL=https://aplus.tj\"
ExecStart=$NODE_PATH $FRONTEND_DIR/node_modules/.bin/next start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aplus-nextjs

[Install]
WantedBy=multi-user.target
EOF"

echo "✓ Сервис создан"
echo ""

# 3. Обновляем Nginx для проксирования на порт 3000
echo "3. Обновление Nginx конфигурации..."
NGINX_CONF="/etc/nginx/sites-available/aplus"

# Создаем резервную копию
sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

# Обновляем секцию location / для проксирования на Next.js
sudo sed -i '/# ==================== NEXT.JS FRONTEND ====================/,/# ==================== БЕЗОПАСНОСТЬ ====================/{
    /# ==================== NEXT.JS FRONTEND ====================/{
        n
        /location \/ /{
            :a
            N
            /}/!ba
            c\
    # ==================== NEXT.JS FRONTEND ====================
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
        }
    }
}' "$NGINX_CONF" || {
    # Если sed не сработал, используем более простой метод
    echo "Используем альтернативный метод обновления..."
    # Найдем и заменим секцию location /
    sudo python3 << PYEOF
import re

with open('$NGINX_CONF', 'r') as f:
    content = f.read()

# Заменяем секцию location / для Next.js
pattern = r'# ==================== NEXT\.JS FRONTEND ====================\s+location / \{.*?\n\s+\}'
replacement = '''# ==================== NEXT.JS FRONTEND ====================
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('$NGINX_CONF', 'w') as f:
    f.write(content)
PYEOF
}

echo "✓ Nginx конфигурация обновлена"
echo ""

# 4. Проверяем конфигурацию Nginx
echo "4. Проверка конфигурации Nginx..."
if sudo nginx -t; then
    echo "✓ Конфигурация корректна"
else
    echo "❌ Ошибка в конфигурации!"
    echo "Восстанавливаем резервную копию..."
    sudo cp "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONF"
    exit 1
fi
echo ""

# 5. Перезагружаем systemd и запускаем сервисы
echo "5. Запуск сервисов..."
sudo systemctl daemon-reload
sudo systemctl enable aplus-nextjs
sudo systemctl start aplus-nextjs
sleep 3

# Перезапускаем Nginx
sudo systemctl restart nginx
echo "✓ Сервисы запущены"
echo ""

# 6. Проверяем статус
echo "6. Проверка статуса..."
echo "----------------------------------------"
echo "Next.js сервис:"
sudo systemctl status aplus-nextjs --no-pager -l | head -15
echo ""

echo "Проверка порта 3000:"
if sudo ss -tlnp | grep -q ":3000"; then
    echo "✓ Next.js слушает на порту 3000"
    sudo ss -tlnp | grep ":3000"
else
    echo "❌ Next.js не слушает на порту 3000"
    echo "Проверьте логи: sudo journalctl -u aplus-nextjs -n 30 --no-pager"
fi
echo ""

echo "Проверка через Nginx:"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://aplus.tj/ || echo "000")
echo "HTTP код: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✓ Сайт работает!"
else
    echo "⚠ Проверьте логи:"
    echo "  sudo journalctl -u aplus-nextjs -n 30 --no-pager"
    echo "  sudo tail -20 /var/log/nginx/aplus_error.log"
fi

echo ""
echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Next.js настроен как сервис и работает на порту 3000"
echo "Nginx проксирует запросы к Next.js"
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""




