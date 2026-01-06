#!/bin/bash
# Скрипт для копирования проекта с ноутбука на сервер
# Использование: bash clone_to_server.sh

SERVER_IP="89.23.100.163"
SERVER_USER="root"
SERVER_PASS="p@wi^w59YZLMyN"
SERVER_PATH="/var/www/aplus"

echo "=========================================="
echo "  Копирование проекта на сервер"
echo "  $SERVER_USER@$SERVER_IP:$SERVER_PATH"
echo "=========================================="
echo ""

# Переход в директорию проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите его:"
    echo "   sudo apt-get install sshpass"
    echo ""
    echo "Или используйте rsync напрямую (потребуется ввод пароля):"
    echo "   rsync -avz --exclude 'node_modules' --exclude '__pycache__' \\"
    echo "     --exclude '.next' --exclude 'venv' --exclude '.git' \\"
    echo "     'A+ pr/' $SERVER_USER@$SERVER_IP:$SERVER_PATH/"
    exit 1
fi

echo "Создание директории на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

echo ""
echo "Копирование файлов проекта..."
echo "Это может занять некоторое время..."
echo ""

# Используем rsync с sshpass через SSH
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude 'venv' \
  --exclude '.git' \
  --exclude 'db.sqlite3' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env' \
  --exclude '.env.local' \
  -e "sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "A+ pr/" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✓ Копирование завершено успешно!"
    echo "=========================================="
    echo ""
    echo "Проект скопирован в: $SERVER_PATH"
    echo ""
    echo "Следующие шаги:"
    echo "1. Подключитесь к серверу:"
    echo "   ssh $SERVER_USER@$SERVER_IP"
    echo ""
    echo "2. Выполните настройку (см. REMOTE_INSTALL.md)"
else
    echo ""
    echo "✗ Ошибка при копировании!"
    exit 1
fi

