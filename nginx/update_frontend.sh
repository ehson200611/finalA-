#!/bin/bash
# Обновление frontend на сервере
# Выполните на вашем компьютере: bash update_frontend.sh

set -e

SERVER="root@89.23.100.163"
SERVER_PASS="p@wi^w59YZLMyN"
FRONTEND_DIR="frontenda/Learning-center-A-Client"
SERVER_PATH="/var/www/aplus/finalA-/frontenda/Learning-center-A-Client"

echo "=========================================="
echo "  ОБНОВЛЕНИЕ FRONTEND НА СЕРВЕРЕ"
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
echo "1. Синхронизация файлов на сервер..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'package-lock.json' \
  --exclude 'yarn.lock' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  "$FRONTEND_DIR/" \
  "$SERVER:$SERVER_PATH/"

echo ""
echo "✓ Файлы синхронизированы"
echo ""

# Выполняем команды на сервере
echo "2. Выполнение команд на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" << 'ENDSSH'
cd /var/www/aplus/finalA-/frontenda/Learning-center-A-Client

echo "Остановка Next.js сервиса..."
sudo systemctl stop aplus-nextjs
pkill -f "next start" 2>/dev/null || true
sleep 2

echo "Удаление старой сборки..."
rm -rf .next

echo "Пересборка проекта..."
if [ -f "yarn.lock" ]; then
    yarn build
else
    npm run build
fi

echo "Запуск Next.js сервиса..."
sudo systemctl restart aplus-nextjs
sleep 5

echo "Проверка статуса..."
if sudo systemctl is-active --quiet aplus-nextjs; then
    echo "✓ Next.js запущен"
else
    echo "⚠ Next.js не запустился, проверьте логи:"
    sudo journalctl -u aplus-nextjs -n 20 --no-pager
fi

echo ""
echo "Проверка порта 3000..."
if ss -tuln 2>/dev/null | grep -q ":3000" || netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✓ Порт 3000 слушается"
else
    echo "⚠ Порт 3000 не слушается"
fi

echo ""
echo "✓ Готово!"
ENDSSH

echo ""
echo "=========================================="
echo "  ОБНОВЛЕНИЕ ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

