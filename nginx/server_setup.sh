#!/bin/bash
# Скрипт для настройки сервера
# Выполните на сервере: bash server_setup.sh

set -e

echo "=========================================="
echo "  Настройка сервера для A+ Learning Center"
echo "=========================================="
echo ""

# Обновление системы
echo "Шаг 1: Обновление системы..."
apt update && apt upgrade -y

# Установка необходимых пакетов
echo "Шаг 2: Установка необходимых пакетов..."
apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib git build-essential curl

# Установка Node.js 18+
echo "Шаг 3: Установка Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Проверка версий
echo ""
echo "Проверка установленных версий:"
python3 --version
node --version
npm --version
nginx -v

# Создание директории проекта
echo ""
echo "Шаг 4: Создание директории проекта..."
mkdir -p /var/www/aplus
chown -R $USER:$USER /var/www/aplus

# Настройка PostgreSQL
echo ""
echo "Шаг 5: Настройка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL не установлен. Устанавливаю..."
    apt install -y postgresql postgresql-contrib
fi

# Создание базы данных и пользователя
echo ""
echo "Создание базы данных..."
sudo -u postgres psql << 'EOF'
-- Создание базы данных
CREATE DATABASE aplus_db;

-- Создание пользователя
CREATE USER aplus_user WITH PASSWORD 'aplus_secure_password_2024';

-- Настройка прав
ALTER ROLE aplus_user SET client_encoding TO 'utf8';
ALTER ROLE aplus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aplus_user SET timezone TO 'UTC';

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE aplus_db TO aplus_user;

-- Выход
\q
EOF

echo ""
echo "=========================================="
echo "  ✓ Настройка сервера завершена!"
echo "=========================================="
echo ""
echo "Следующие шаги:"
echo "1. Скопируйте файлы проекта в /var/www/aplus"
echo "2. Настройте Django (см. DEPLOYMENT.md)"
echo "3. Настройте Next.js"
echo "4. Запустите сервисы"
echo ""
echo "Пароль базы данных: aplus_secure_password_2024"
echo "Измените его в settings.py после копирования проекта!"

