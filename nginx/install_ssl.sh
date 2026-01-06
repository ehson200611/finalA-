#!/bin/bash

# Скрипт для установки SSL сертификатов для aplus.tj

echo "Установка SSL сертификатов для aplus.tj..."

# Создание директории для SSL
sudo mkdir -p /etc/nginx/ssl

# Проверка существования файлов в текущей директории
if [ -f "ssl/aplus.tj.key" ] && [ -f "ssl/aplus.tj.crt" ]; then
    echo "Копирование сертификатов из локальной директории..."
    sudo cp ssl/aplus.tj.key /etc/nginx/ssl/
    sudo cp ssl/aplus.tj.crt /etc/nginx/ssl/
elif [ -f "aplus.tj.key" ] && [ -f "aplus.tj.crt" ]; then
    echo "Копирование сертификатов из текущей директории..."
    sudo cp aplus.tj.key /etc/nginx/ssl/
    sudo cp aplus.tj.crt /etc/nginx/ssl/
else
    echo "ВНИМАНИЕ: Файлы сертификатов не найдены!"
    echo "Пожалуйста, создайте файлы вручную:"
    echo "  sudo nano /etc/nginx/ssl/aplus.tj.key"
    echo "  sudo nano /etc/nginx/ssl/aplus.tj.crt"
    echo ""
    echo "Или скопируйте файлы в директорию nginx/ssl/ и запустите скрипт снова."
    exit 1
fi

# Установка правильных прав доступа
echo "Установка прав доступа..."
sudo chmod 600 /etc/nginx/ssl/aplus.tj.key
sudo chmod 644 /etc/nginx/ssl/aplus.tj.crt
sudo chown root:root /etc/nginx/ssl/aplus.tj.key
sudo chown root:root /etc/nginx/ssl/aplus.tj.crt

# Проверка конфигурации Nginx
echo "Проверка конфигурации Nginx..."
if sudo nginx -t; then
    echo "✓ Конфигурация Nginx корректна"
    echo ""
    echo "Для применения изменений выполните:"
    echo "  sudo systemctl restart nginx"
else
    echo "✗ Ошибка в конфигурации Nginx!"
    exit 1
fi

echo ""
echo "Готово! SSL сертификаты установлены."
echo "Проверьте работу сайта: https://aplus.tj"

