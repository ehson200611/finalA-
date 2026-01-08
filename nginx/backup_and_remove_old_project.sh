#!/bin/bash
# Резервное копирование и удаление старого проекта
# Выполните на сервере: bash backup_and_remove_old_project.sh

set -e

echo "=========================================="
echo "  РЕЗЕРВНОЕ КОПИРОВАНИЕ И УДАЛЕНИЕ"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/aplus/finalA-"
BACKUP_DIR="/var/www/aplus/backup_$(date +%Y%m%d_%H%M%S)"

echo "Проект: $PROJECT_DIR"
echo "Резервная копия: $BACKUP_DIR"
echo ""

# Останавливаем сервисы
echo "1. Остановка сервисов..."
sudo systemctl stop aplus-django 2>/dev/null || true
sudo systemctl stop aplus-nextjs 2>/dev/null || true
pkill -f "gunicorn" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
echo "✓ Сервисы остановлены"
echo ""

# Создаем резервную копию
echo "2. Создание резервной копии..."
if [ -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$(dirname $BACKUP_DIR)"
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo "✓ Резервная копия создана: $BACKUP_DIR"
else
    echo "⚠ Проект не найден, резервная копия не создана"
fi
echo ""

# Удаляем старый проект
echo "3. Удаление старого проекта..."
if [ -d "$PROJECT_DIR" ]; then
    sudo rm -rf "$PROJECT_DIR"
    echo "✓ Старый проект удален"
else
    echo "⚠ Проект уже не существует"
fi
echo ""

# Удаляем systemd сервисы (опционально)
echo "4. Удаление systemd сервисов..."
sudo systemctl disable aplus-django 2>/dev/null || true
sudo systemctl disable aplus-nextjs 2>/dev/null || true
sudo rm -f /etc/systemd/system/aplus-django.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/aplus-nextjs.service 2>/dev/null || true
sudo systemctl daemon-reload
echo "✓ Сервисы удалены"
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Старый проект удален."
echo "Резервная копия сохранена в: $BACKUP_DIR"
echo ""
echo "Теперь можно развернуть новый проект."
echo ""

