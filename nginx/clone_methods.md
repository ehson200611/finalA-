# Способы копирования проекта на сервер

## Способ 1: Автоматический скрипт (рекомендуется)

```bash
cd "A+ pr/nginx"
bash clone_to_server.sh
```

Скрипт автоматически:
- Создаст директорию на сервере
- Скопирует все файлы проекта
- Исключит ненужные файлы (node_modules, __pycache__, и т.д.)

## Способ 2: Использование rsync (вручную)

### С sshpass (без ввода пароля):
```bash
# Установите sshpass
sudo apt-get install sshpass

# Скопируйте проект
cd "A+ pr"
sshpass -p 'p@wi^w59YZLMyN' rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude 'venv' \
  --exclude '.git' \
  --exclude 'db.sqlite3' \
  "A+ pr/" root@89.23.100.163:/var/www/aplus/
```

### Без sshpass (с вводом пароля):
```bash
cd "A+ pr"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude 'venv' \
  --exclude '.git' \
  --exclude 'db.sqlite3' \
  "A+ pr/" root@89.23.100.163:/var/www/aplus/
```

## Способ 3: Использование scp (простой способ)

### Создание архива и копирование:
```bash
cd "A+ pr"
tar -czf /tmp/aplus_project.tar.gz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.next' \
  --exclude='venv' \
  --exclude='.git' \
  --exclude='db.sqlite3' \
  .

# Копирование на сервер
sshpass -p 'p@wi^w59YZLMyN' scp /tmp/aplus_project.tar.gz root@89.23.100.163:/tmp/

# На сервере распакуйте:
ssh root@89.23.100.163
cd /var/www/aplus
tar -xzf /tmp/aplus_project.tar.gz
rm /tmp/aplus_project.tar.gz
```

## Способ 4: Использование Git (если проект в репозитории)

### На сервере:
```bash
ssh root@89.23.100.163
cd /var/www/aplus
git clone <ваш-repo-url> .
# или
git pull  # если уже клонирован
```

## Способ 5: Использование SFTP клиента

Используйте графический клиент (FileZilla, WinSCP и т.д.):
- Хост: 89.23.100.163
- Пользователь: root
- Пароль: p@wi^w59YZLMyN
- Протокол: SFTP
- Порт: 22

## Что исключается при копировании:

- `node_modules/` - зависимости Node.js (установятся через npm install)
- `__pycache__/` - кеш Python
- `.next/` - собранные файлы Next.js (соберутся через npm run build)
- `venv/` - виртуальное окружение Python (создастся на сервере)
- `.git/` - репозиторий Git (если не нужен)
- `db.sqlite3` - локальная база данных (создастся на сервере)
- `*.pyc` - скомпилированные файлы Python
- `.env`, `.env.local` - локальные переменные окружения

## После копирования на сервере:

```bash
# 1. Настройка Django
cd /var/www/aplus/content_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
python manage.py migrate
python manage.py collectstatic --noinput

# 2. Настройка Next.js
cd /var/www/aplus/frontenda/Learning-center-A-Client
npm install
echo "NEXT_PUBLIC_API_URL=https://aplus.tj" > .env.local
npm run build

# 3. Запуск
systemctl start aplus-django
systemctl restart nginx
```

## Проверка скорости копирования:

Для больших проектов можно использовать:
```bash
rsync -avz --progress --partial \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  "A+ pr/" root@89.23.100.163:/var/www/aplus/
```

Параметр `--partial` позволяет продолжить прерванное копирование.

