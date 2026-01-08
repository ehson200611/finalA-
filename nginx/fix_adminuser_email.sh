#!/bin/bash
# Исправление ошибки с отсутствующим полем email в AdminUser
# Выполните на сервере: bash fix_adminuser_email.sh

set -e

echo "=========================================="
echo "  ИСПРАВЛЕНИЕ ПОЛЯ EMAIL В ADMINUSER"
echo "=========================================="
echo ""

WORK_DIR="/var/www/aplus/finalA-/content_api"

# Проверяем, где находится venv
if [ -d "$WORK_DIR/venv" ]; then
    VENV_PATH="$WORK_DIR/venv"
elif [ -d "$WORK_DIR/.venv" ]; then
    VENV_PATH="$WORK_DIR/.venv"
else
    echo "❌ Ошибка: venv не найден!"
    exit 1
fi

echo "Venv путь: $VENV_PATH"
echo ""

# Активируем виртуальное окружение
source "$VENV_PATH/bin/activate"

# Переходим в рабочую директорию
cd "$WORK_DIR"

# Создаем миграцию для authenticator
echo "1. Создание миграции для authenticator..."
python manage.py makemigrations authenticator
echo ""

# Применяем миграции
echo "2. Применение миграций..."
python manage.py migrate authenticator
echo ""

# Проверяем, что миграции применены
echo "3. Проверка статуса миграций..."
python manage.py showmigrations authenticator | tail -5
echo ""

# Перезапускаем Django сервис
echo "4. Перезапуск Django сервиса..."
sudo systemctl restart aplus-django
sleep 2

# Проверяем статус
echo ""
echo "Статус сервиса:"
sudo systemctl status aplus-django --no-pager -l | head -15

echo ""
echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""

