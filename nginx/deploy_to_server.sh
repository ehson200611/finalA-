#!/bin/bash

# Скрипт автоматической установки проекта на сервер
# Использование: ./deploy_to_server.sh

set -e  # Остановка при ошибке

echo "=========================================="
echo "  Установка A+ Learning Center на сервер"
echo "=========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Ошибка: Скрипт должен быть запущен от root${NC}"
    echo "Используйте: sudo bash deploy_to_server.sh"
    exit 1
fi

# Путь к проекту на сервере (измените при необходимости)
PROJECT_PATH="/var/www/aplus"
NGINX_SSL_PATH="/etc/nginx/ssl"

echo -e "${YELLOW}Шаг 1: Обновление системы...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Шаг 2: Установка необходимых пакетов...${NC}"
apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib git build-essential curl
apt install -y nodejs npm || {
    # Если nodejs не установлен, установим через NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
}

echo -e "${YELLOW}Шаг 3: Создание директории проекта...${NC}"
mkdir -p $PROJECT_PATH
mkdir -p $NGINX_SSL_PATH

echo -e "${YELLOW}Шаг 4: Установка SSL сертификатов...${NC}"
# Проверяем, есть ли файлы сертификатов в текущей директории
if [ -f "ssl/aplus.tj.key.txt" ] && [ -f "ssl/aplus.tj.crt.txt" ]; then
    cp ssl/aplus.tj.key.txt $NGINX_SSL_PATH/aplus.tj.key
    cp ssl/aplus.tj.crt.txt $NGINX_SSL_PATH/aplus.tj.crt
    chmod 600 $NGINX_SSL_PATH/aplus.tj.key
    chmod 644 $NGINX_SSL_PATH/aplus.tj.crt
    chown root:root $NGINX_SSL_PATH/aplus.tj.*
    echo -e "${GREEN}✓ SSL сертификаты установлены${NC}"
else
    echo -e "${RED}⚠ Внимание: Файлы сертификатов не найдены!${NC}"
    echo "Создайте файлы вручную:"
    echo "  nano $NGINX_SSL_PATH/aplus.tj.key"
    echo "  nano $NGINX_SSL_PATH/aplus.tj.crt"
fi

echo -e "${YELLOW}Шаг 5: Настройка Nginx...${NC}"
# Копируем конфигурацию nginx
if [ -f "nginx.conf" ]; then
    # Обновляем пути в конфигурации
    sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr|$PROJECT_PATH|g" nginx.conf
    cp nginx.conf /etc/nginx/sites-available/aplus
    
    # Создаем символическую ссылку
    if [ -L /etc/nginx/sites-enabled/aplus ]; then
        rm /etc/nginx/sites-enabled/aplus
    fi
    ln -s /etc/nginx/sites-available/aplus /etc/nginx/sites-enabled/
    
    # Удаляем дефолтную конфигурацию если есть
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    # Проверяем конфигурацию
    if nginx -t; then
        echo -e "${GREEN}✓ Конфигурация Nginx корректна${NC}"
    else
        echo -e "${RED}✗ Ошибка в конфигурации Nginx!${NC}"
        exit 1
    fi
else
    echo -e "${RED}⚠ Файл nginx.conf не найден!${NC}"
fi

echo -e "${YELLOW}Шаг 6: Настройка Gunicorn...${NC}"
# Устанавливаем gunicorn глобально (для systemd service)
pip3 install gunicorn

# Копируем конфигурацию gunicorn
if [ -f "gunicorn_config.py" ]; then
    mkdir -p $PROJECT_PATH/content_api
    cp gunicorn_config.py $PROJECT_PATH/content_api/
    # Обновляем пути в конфигурации
    sed -i "s|BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))|BASE_DIR = '$PROJECT_PATH/content_api'|g" $PROJECT_PATH/content_api/gunicorn_config.py
fi

echo -e "${YELLOW}Шаг 7: Настройка systemd service...${NC}"
if [ -f "aplus-django.service" ]; then
    # Обновляем пути в service файле
    sed -i "s|/home/ehson/Рабочий\\\\ стол/A+\\\\ pr|$PROJECT_PATH|g" aplus-django.service
    cp aplus-django.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable aplus-django
    echo -e "${GREEN}✓ Systemd service настроен${NC}"
    echo -e "${YELLOW}  Примечание: Запустите сервис после настройки Django:${NC}"
    echo -e "${YELLOW}  systemctl start aplus-django${NC}"
fi

echo -e "${YELLOW}Шаг 8: Настройка файрвола...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw --force enable
    echo -e "${GREEN}✓ Файрвол настроен${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  Установка завершена!"
echo "==========================================${NC}"
echo ""
echo "Следующие шаги:"
echo ""
echo "1. Скопируйте файлы проекта в $PROJECT_PATH"
echo "2. Настройте Django:"
echo "   cd $PROJECT_PATH/content_api"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   pip install gunicorn"
echo "   python manage.py migrate"
echo "   python manage.py collectstatic --noinput"
echo ""
echo "3. Настройте Next.js:"
echo "   cd $PROJECT_PATH/frontenda/Learning-center-A-Client"
echo "   npm install"
echo "   echo 'NEXT_PUBLIC_API_URL=https://aplus.tj' > .env.local"
echo "   npm run build"
echo ""
echo "4. Запустите сервисы:"
echo "   systemctl start aplus-django"
echo "   systemctl restart nginx"
echo ""
echo "5. Проверьте работу:"
echo "   systemctl status aplus-django"
echo "   systemctl status nginx"
echo "   curl -I https://aplus.tj"
echo ""

