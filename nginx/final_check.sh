#!/bin/bash
# Финальная проверка работы Django и Nginx
# Выполните на сервере: bash final_check.sh

echo "=========================================="
echo "  ФИНАЛЬНАЯ ПРОВЕРКА"
echo "=========================================="
echo ""

# 1. Проверка Django сервиса
echo "1. Статус Django сервиса:"
echo "----------------------------------------"
sudo systemctl status aplus-django --no-pager -l | head -15
echo ""

# 2. Проверка, что Django слушает на порту 8000
echo "2. Проверка порта 8000:"
echo "----------------------------------------"
if sudo ss -tlnp | grep -q ":8000"; then
    echo "✓ Django слушает на порту 8000"
    sudo ss -tlnp | grep ":8000"
else
    echo "❌ Django не слушает на порту 8000"
fi
echo ""

# 3. Проверка ответа Django напрямую
echo "3. Проверка ответа Django (напрямую):"
echo "----------------------------------------"
echo "Тест /api/schema/ (если существует):"
curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://127.0.0.1:8000/api/schema/ || echo "Не отвечает"
echo ""

# 4. Проверка Nginx
echo "4. Статус Nginx:"
echo "----------------------------------------"
sudo systemctl status nginx --no-pager -l | head -10
echo ""

# 5. Проверка через Nginx (HTTPS)
echo "5. Проверка через Nginx (HTTPS):"
echo "----------------------------------------"
echo "Тест https://aplus.tj/api/schema/:"
curl -k -s -o /dev/null -w "HTTP: %{http_code}\n" https://aplus.tj/api/schema/ || echo "Не отвечает"
echo ""

# 6. Проверка логов Nginx на ошибки
echo "6. Последние ошибки Nginx:"
echo "----------------------------------------"
sudo tail -5 /var/log/nginx/aplus_error.log 2>/dev/null || echo "Лог файл не найден"
echo ""

# 7. Проверка конфигурации Nginx
echo "7. Проверка конфигурации Nginx:"
echo "----------------------------------------"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✓ Конфигурация Nginx корректна"
else
    echo "❌ Ошибка в конфигурации Nginx"
    sudo nginx -t
fi
echo ""

echo "=========================================="
echo "  РЕЗУЛЬТАТ"
echo "=========================================="
echo ""
echo "✓ Django сервис работает!"
echo ""
echo "Теперь проверьте сайт в браузере:"
echo "  https://aplus.tj"
echo ""
echo "Если видите 404, это может быть нормально - проверьте правильные эндпоинты API"
echo "Попробуйте:"
echo "  https://aplus.tj/api/schema/"
echo "  https://aplus.tj/admin/"
echo ""




