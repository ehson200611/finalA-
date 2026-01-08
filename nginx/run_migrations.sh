#!/bin/bash
# Выполнение миграций на сервере
# Выполните на сервере: bash run_migrations.sh

set -e

echo "=========================================="
echo "  ВЫПОЛНЕНИЕ МИГРАЦИЙ"
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

# Проверяем, что Django установлен
echo "Проверка Django..."
if python -c "import django; print(f'Django {django.__version__}')" 2>/dev/null; then
    echo "✓ Django установлен"
else
    echo "❌ Django не установлен в venv!"
    echo "Установите: pip install -r requirements.txt"
    exit 1
fi
echo ""

# Переходим в рабочую директорию
cd "$WORK_DIR"

# Создаем миграции
echo "Создание миграций для home_page..."
python manage.py makemigrations home_page
echo ""

# Применяем миграции
echo "Применение миграций..."
python manage.py migrate home_page
echo ""

# Перезапускаем Django сервис
echo "Перезапуск Django сервиса..."
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

