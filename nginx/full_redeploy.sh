#!/bin/bash
# Полное переразвертывание проекта
# Выполните на вашем компьютере: bash full_redeploy.sh

set -e

echo "=========================================="
echo "  ПОЛНОЕ ПЕРЕРАЗВЕРТЫВАНИЕ ПРОЕКТА"
echo "=========================================="
echo ""

SERVER="root@89.23.100.163"
SERVER_PASS="p@wi^w59YZLMyN"

# Проверяем sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠ sshpass не установлен. Установите:"
    echo "   sudo apt-get install sshpass"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DIR="$(dirname "$SCRIPT_DIR")"
cd "$LOCAL_DIR"

echo "Локальная директория: $LOCAL_DIR"
echo ""

# Копируем скрипты на сервер
echo "1. Копирование скриптов на сервер..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no \
    "$SCRIPT_DIR/backup_and_remove_old_project.sh" \
    "$SERVER:/tmp/"

echo "2. Резервное копирование и удаление старого проекта..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER" \
    "bash /tmp/backup_and_remove_old_project.sh"

echo ""
echo "3. Развертывание нового проекта..."
bash "$SCRIPT_DIR/deploy_fresh_project.sh"

echo ""
echo "=========================================="
echo "  ПЕРЕРАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО"
echo "=========================================="
echo ""
echo "Проверьте статус:"
echo "  ssh $SERVER 'sudo systemctl status aplus-django aplus-nextjs nginx'"
echo ""
echo "Проверьте сайт: https://aplus.tj"
echo ""

