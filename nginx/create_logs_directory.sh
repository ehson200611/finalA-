#!/bin/bash
# Создание директории для логов
# Выполните на сервере: bash create_logs_directory.sh

set -e

PROJECT_DIR="/var/www/aplus/finalA-"
LOGS_DIR="$PROJECT_DIR/logs"

echo "=========================================="
echo "  СОЗДАНИЕ ДИРЕКТОРИИ ДЛЯ ЛОГОВ"
echo "=========================================="
echo ""

# 1. Создаем директорию для логов
echo "1. Создание директории для логов..."
sudo mkdir -p "$LOGS_DIR"
echo "✓ Директория создана: $LOGS_DIR"
echo ""

# 2. Устанавливаем права доступа
echo "2. Установка прав доступа..."
sudo chown -R root:root "$LOGS_DIR"
sudo chmod -R 755 "$LOGS_DIR"
echo "✓ Права установлены"
echo ""

# 3. Создаем файлы логов (если нужно)
echo "3. Создание файлов логов..."
sudo touch "$LOGS_DIR/gunicorn_error.log"
sudo touch "$LOGS_DIR/gunicorn_access.log"
sudo chmod 644 "$LOGS_DIR"/*.log
echo "✓ Файлы логов созданы"
echo ""

# 4. Проверяем конфигурацию gunicorn
echo "4. Проверка конфигурации gunicorn..."
if [ -f "$PROJECT_DIR/nginx/gunicorn_config.py" ]; then
    echo "Конфигурация gunicorn:"
    grep -E "(errorlog|accesslog)" "$PROJECT_DIR/nginx/gunicorn_config.py" || echo "Логи не настроены в конфиге"
    echo ""
    
    # Проверяем, что пути правильные
    if grep -q "/var/www/aplus/finalA-/logs" "$PROJECT_DIR/nginx/gunicorn_config.py"; then
        echo "✓ Пути к логам правильные"
    else
        echo "⚠ Пути к логам могут быть неправильными"
    fi
else
    echo "⚠ Файл конфигурации gunicorn не найден"
fi
echo ""

# 5. Перезапускаем Django сервис
echo "5. Перезапуск Django сервиса..."
sudo systemctl restart aplus-django
sleep 3

if sudo systemctl is-active --quiet aplus-django; then
    echo "✓ Django запущен успешно!"
else
    echo "❌ Django не запустился"
    echo "Логи:"
    sudo journalctl -u aplus-django -n 10 --no-pager
fi
echo ""

# 6. Проверяем статус
echo "6. Статус сервиса:"
sudo systemctl status aplus-django --no-pager -l | head -15
echo ""

# 7. Проверяем, что логи создаются
echo "7. Проверка логов:"
if [ -f "$LOGS_DIR/gunicorn_error.log" ]; then
    echo "✓ Файл лога ошибок существует"
    ls -lh "$LOGS_DIR/gunicorn_error.log"
else
    echo "⚠ Файл лога ошибок не найден"
fi
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""

