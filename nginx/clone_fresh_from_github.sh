#!/bin/bash
# Удаление старого проекта и клонирование нового из GitHub
# Выполните на сервере: bash clone_fresh_from_github.sh

set -e

# ============================================
# НАСТРОЙКИ - ИЗМЕНИТЕ ЭТИ ПАРАМЕТРЫ
# ============================================
GITHUB_REPO_URL=""  # Укажите URL вашего GitHub репозитория
PROJECT_DIR="/var/www/aplus/finalA-"
BACKUP_DIR="/var/www/aplus/backup_$(date +%Y%m%d_%H%M%S)"

# Если URL не указан, попросите пользователя ввести
if [ -z "$GITHUB_REPO_URL" ]; then
    echo "Введите URL вашего GitHub репозитория:"
    read -r GITHUB_REPO_URL
fi

if [ -z "$GITHUB_REPO_URL" ]; then
    echo "❌ Ошибка: URL репозитория не указан!"
    exit 1
fi

echo "=========================================="
echo "  КЛОНИРОВАНИЕ ПРОЕКТА ИЗ GITHUB"
echo "=========================================="
echo ""
echo "Репозиторий: $GITHUB_REPO_URL"
echo "Директория: $PROJECT_DIR"
echo ""

# Останавливаем сервисы
echo "1. Остановка сервисов..."
sudo systemctl stop aplus-django 2>/dev/null || true
sudo systemctl stop aplus-nextjs 2>/dev/null || true
pkill -f "gunicorn" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
echo "✓ Сервисы остановлены"
echo ""

# Создаем резервную копию (если проект существует)
if [ -d "$PROJECT_DIR" ]; then
    echo "2. Создание резервной копии..."
    sudo mkdir -p "$(dirname $BACKUP_DIR)"
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo "✓ Резервная копия создана: $BACKUP_DIR"
    echo ""
    
    # Удаляем старый проект
    echo "3. Удаление старого проекта..."
    sudo rm -rf "$PROJECT_DIR"
    echo "✓ Старый проект удален"
    echo ""
else
    echo "2. Старый проект не найден, пропускаем резервное копирование"
    echo ""
fi

# Создаем директорию для проекта
echo "4. Создание директории..."
sudo mkdir -p "$(dirname $PROJECT_DIR)"
cd "$(dirname $PROJECT_DIR)"
echo "✓ Директория создана"
echo ""

# Клонируем проект из GitHub
echo "5. Клонирование проекта из GitHub..."
if [ -d "$(basename $PROJECT_DIR)" ]; then
    sudo rm -rf "$(basename $PROJECT_DIR)"
fi

# Клонируем репозиторий
git clone "$GITHUB_REPO_URL" "$(basename $PROJECT_DIR)" || {
    echo "❌ Ошибка при клонировании репозитория!"
    echo "Проверьте URL и права доступа к репозиторию."
    exit 1
}

echo "✓ Проект клонирован"
echo ""

# Настраиваем права доступа
echo "6. Настройка прав доступа..."
sudo chown -R root:root "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"
echo "✓ Права настроены"
echo ""

# Настраиваем Django
echo "7. Настройка Django..."
cd "$PROJECT_DIR/content_api"

# Создаем виртуальное окружение
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Устанавливаем зависимости
echo "Установка Python зависимостей..."
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    pip install django djangorestframework django-cors-headers gunicorn
fi

# Применяем миграции
echo "Применение миграций..."
python manage.py migrate

# Собираем статические файлы
echo "Сборка статических файлов..."
python manage.py collectstatic --noinput

echo "✓ Django настроен"
echo ""

# Настраиваем Next.js
echo "8. Настройка Next.js..."
cd "$PROJECT_DIR/frontenda/Learning-center-A-Client"

# Устанавливаем зависимости
if [ ! -d "node_modules" ]; then
    echo "Установка Node.js зависимостей..."
    npm install
fi

# Собираем проект
echo "Сборка Next.js проекта..."
npm run build

echo "✓ Next.js настроен"
echo ""

# Настраиваем systemd сервисы
echo "9. Настройка systemd сервисов..."
cd "$PROJECT_DIR/nginx"

# Копируем сервисы
if [ -f "aplus-django.service" ]; then
    sudo cp aplus-django.service /etc/systemd/system/
    sudo sed -i "s|/var/www/aplus/finalA-|$PROJECT_DIR|g" /etc/systemd/system/aplus-django.service
fi

if [ -f "aplus-nextjs.service" ]; then
    sudo cp aplus-nextjs.service /etc/systemd/system/
    sudo sed -i "s|/var/www/aplus/finalA-|$PROJECT_DIR|g" /etc/systemd/system/aplus-nextjs.service
fi

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем и запускаем сервисы
if [ -f "/etc/systemd/system/aplus-django.service" ]; then
    sudo systemctl enable aplus-django
    sudo systemctl start aplus-django
fi

if [ -f "/etc/systemd/system/aplus-nextjs.service" ]; then
    sudo systemctl enable aplus-nextjs
    sudo systemctl start aplus-nextjs
fi

echo "✓ Systemd сервисы настроены"
echo ""

# Настраиваем Nginx
echo "10. Настройка Nginx..."
if [ -f "$PROJECT_DIR/nginx/aplus" ]; then
    sudo cp "$PROJECT_DIR/nginx/aplus" /etc/nginx/sites-available/
    sudo sed -i "s|/var/www/aplus/finalA-|$PROJECT_DIR|g" /etc/nginx/sites-available/aplus
    sudo ln -sf /etc/nginx/sites-available/aplus /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
    echo "✓ Nginx настроен"
else
    echo "⚠ Файл конфигурации Nginx не найден"
fi
echo ""

echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo ""
echo "Проект успешно клонирован и настроен!"
echo ""
echo "Проверьте статус сервисов:"
echo "  sudo systemctl status aplus-django aplus-nextjs nginx"
echo ""
if [ -d "$BACKUP_DIR" ]; then
    echo "Резервная копия сохранена в: $BACKUP_DIR"
fi
echo ""

