ИНСТРУКЦИЯ ПО УСТАНОВКЕ SSL СЕРТИФИКАТОВ
==========================================

1. Сохраните приватный ключ в файл aplus.tj.key
2. Сохраните сертификат в файл aplus.tj.crt
3. Запустите скрипт установки: bash install_ssl.sh

ИЛИ вручную:

1. Создайте директорию:
   sudo mkdir -p /etc/nginx/ssl

2. Скопируйте файлы:
   sudo cp aplus.tj.key /etc/nginx/ssl/
   sudo cp aplus.tj.crt /etc/nginx/ssl/

3. Установите права:
   sudo chmod 600 /etc/nginx/ssl/aplus.tj.key
   sudo chmod 644 /etc/nginx/ssl/aplus.tj.crt
   sudo chown root:root /etc/nginx/ssl/aplus.tj.*

4. Проверьте конфигурацию:
   sudo nginx -t

5. Перезапустите Nginx:
   sudo systemctl restart nginx

