#!/bin/bash
# Скрипт для выполнения на вашем компьютере
# Копирует скрипт клонирования на сервер и запускает его
# Выполните: bash run_clone_on_server.sh

set -e

SERVER="root@89.23.100.163"
SERVER_PASS="p@wi^w59YZLMyN"
GITHUB_REPO_URL=""

echo "=========================================="
echo "  КЛОНИРОВАНИЕ ПРОЕКТА НА СЕРВЕР"
echo "=========================================="
echo ""

# Проверяем sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите:"
    echo "   sudo apt-get install sshpass"
    exit 1
fi

# Запрашиваем URL репозитория
if [ -z "$GITHUB_REPO_URL" ]; then
    echo "Введите URL вашего GitHub репозитория:"
    echo "Пример: https://github.com/username/repository.git"
    read -r GITHUB_REPO_URL
fi

if [ -z "$GITHUB_REPO_URL" ]; then
    echo "❌ Ошибка: URL репозитория не указан!"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Копируем скрипт на сервер
echo "Копирование скрипта на сервер..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no \
    "$SCRIPT_DIR/clone_fresh_from_github.sh" \
    "$SERVER:/tmp/clone_project.sh"

# Выполняем скрипт на сервере с передачей URL репозитория
echo ""
echo "Запуск клонирования на сервере..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" << ENDSSH
export GITHUB_REPO_URL="$GITHUB_REPO_URL"
bash /tmp/clone_project.sh
ENDSSH

echo ""
echo "=========================================="
echo "  ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте статус:"
echo "  ssh $SERVER 'sudo systemctl status aplus-django aplus-nextjs nginx'"
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

