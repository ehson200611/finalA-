#!/bin/bash
# Скрипт для установки systemd сервиса на сервере
# Использование: bash install_service.sh

set -e

echo "=========================================="
echo "  Установка aplus-django.service"
echo "=========================================="
echo ""

# Определяем путь к проекту
# Если вы в корне проекта, используем текущую директорию
if [ -f "content_api/manage.py" ]; then
    PROJECT_DIR=$(pwd)
elif [ -f "../content_api/manage.py" ]; then
    PROJECT_DIR=$(cd .. && pwd)
else
    echo "Ошибка: Не могу найти content_api/manage.py"
    echo "Перейдите в корень проекта и запустите скрипт снова"
    exit 1
fi

echo "Найден проект в: $PROJECT_DIR"
echo ""

# Проверяем наличие файла сервиса
SERVICE_FILE=""
if [ -f "nginx/aplus-django.service" ]; then
    SERVICE_FILE="nginx/aplus-django.service"
elif [ -f "aplus-django.service" ]; then
    SERVICE_FILE="aplus-django.service"
elif [ -f "../nginx/aplus-django.service" ]; then
    SERVICE_FILE="../nginx/aplus-django.service"
else
    echo "Ошибка: Не могу найти aplus-django.service"
    echo "Убедитесь, что файл находится в nginx/ или в корне проекта"
    exit 1
fi

echo "Найден файл сервиса: $SERVICE_FILE"
echo ""

# Создаем временный файл с обновленными путями
TEMP_SERVICE="/tmp/aplus-django.service"
cp "$SERVICE_FILE" "$TEMP_SERVICE"

# Заменяем пути в файле
# Экранируем слеши для sed
ESCAPED_PROJECT_DIR=$(echo "$PROJECT_DIR" | sed 's/[\/&]/\\&/g')
sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr|$ESCAPED_PROJECT_DIR|g" "$TEMP_SERVICE"
sed -i "s|/var/www/aplus|$ESCAPED_PROJECT_DIR|g" "$TEMP_SERVICE"

# Показываем обновленный файл
echo "Обновленная конфигурация сервиса:"
echo "----------------------------------------"
cat "$TEMP_SERVICE"
echo "----------------------------------------"
echo ""

# Копируем в systemd
echo "Копирование сервиса в /etc/systemd/system/..."
sudo cp "$TEMP_SERVICE" /etc/systemd/system/aplus-django.service

# Перезагружаем systemd
echo "Перезагрузка systemd daemon..."
sudo systemctl daemon-reload

# Включаем автозапуск
echo "Включение автозапуска сервиса..."
sudo systemctl enable aplus-django

echo ""
echo "=========================================="
echo "  ✓ Сервис установлен!"
echo "=========================================="
echo ""
echo "Теперь вы можете запустить сервис:"
echo "  sudo systemctl start aplus-django"
echo ""
echo "Проверить статус:"
echo "  sudo systemctl status aplus-django"
echo ""
echo "Посмотреть логи:"
echo "  sudo journalctl -u aplus-django -f"
echo ""





