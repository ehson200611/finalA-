#!/bin/bash
# Синхронизация frontend файлов на сервер
# Выполните на вашем компьютере: bash sync_frontend_to_server.sh

set -e

SERVER="root@89.23.100.163"
SERVER_PASS="p@wi^w59YZLMyN"
FRONTEND_DIR="frontenda/Learning-center-A-Client"
SERVER_PATH="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"

echo "=========================================="
echo "  СИНХРОНИЗАЦИЯ FRONTEND НА СЕРВЕР"
echo "=========================================="
echo ""

# Проверяем sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите:"
    echo "   sudo apt-get install sshpass"
    exit 1
fi

# Переходим в корень проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "Локальная директория: $PROJECT_DIR/$FRONTEND_DIR"
echo "Серверная директория: $SERVER_PATH"
echo ""

# Синхронизируем файлы (исключая node_modules, .next, и т.д.)
echo "Синхронизация файлов..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'package-lock.json' \
  --exclude '*.log' \
  "$FRONTEND_DIR/" \
  "$SERVER:$SERVER_PATH/"

echo ""
echo "✓ Файлы синхронизированы"
echo ""

# Выполняем команды на сервере
echo "Выполнение команд на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
cd /var/www/aplus/finalA-/frontenda/Learning-center-A-Client

# Устанавливаем зависимости (если нужно)
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
fi

# Пересобираем проект
echo "Пересборка проекта..."
npm run build

# Перезапускаем Next.js сервис
if systemctl is-active --quiet aplus-nextjs; then
    echo "Перезапуск Next.js сервиса..."
    sudo systemctl restart aplus-nextjs
else
    echo "⚠ Next.js сервис не запущен, запустите вручную: npm start"
fi

# Перезапускаем Nginx
echo "Перезапуск Nginx..."
sudo systemctl restart nginx

echo ""
echo "✓ Готово!"
ENDSSH

echo ""
echo "=========================================="
echo "  СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

