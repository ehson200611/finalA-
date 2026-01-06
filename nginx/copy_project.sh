#!/bin/bash
# Скрипт для копирования проекта на сервер

SERVER_IP="89.23.100.163"
SERVER_USER="root"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "Копирование проекта на сервер..."
echo "Это может занять некоторое время..."
echo ""

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude 'venv' \
  --exclude '.git' \
  --exclude 'db.sqlite3' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  "A+ pr/" "$SERVER_USER@$SERVER_IP:/var/www/aplus/"

echo ""
echo "✓ Копирование завершено!"
echo ""
echo "Теперь подключитесь к серверу и выполните настройку:"
echo "  ssh root@89.23.100.163"
echo ""
echo "См. инструкции в REMOTE_INSTALL.md"

