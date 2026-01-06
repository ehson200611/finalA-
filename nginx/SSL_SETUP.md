# Настройка SSL сертификатов для aplus.tj

## Шаг 1: Сохранение сертификатов на сервере

Создайте директорию для SSL сертификатов:

```bash
sudo mkdir -p /etc/nginx/ssl
```

Скопируйте сертификат и приватный ключ в эту директорию:

```bash
# Сохраните приватный ключ
sudo nano /etc/nginx/ssl/aplus.tj.key
# Вставьте содержимое приватного ключа (-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----)

# Сохраните сертификат
sudo nano /etc/nginx/ssl/aplus.tj.crt
# Вставьте содержимое сертификата (-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----)
```

Или скопируйте файлы напрямую, если они уже сохранены локально:

```bash
# Если файлы находятся в nginx/ssl/ на сервере
sudo cp /path/to/nginx/ssl/aplus.tj.key /etc/nginx/ssl/
sudo cp /path/to/nginx/ssl/aplus.tj.crt /etc/nginx/ssl/
```

## Шаг 2: Установка правильных прав доступа

```bash
# Установите правильные права доступа (только root может читать ключ)
sudo chmod 600 /etc/nginx/ssl/aplus.tj.key
sudo chmod 644 /etc/nginx/ssl/aplus.tj.crt
sudo chown root:root /etc/nginx/ssl/aplus.tj.key
sudo chown root:root /etc/nginx/ssl/aplus.tj.crt
```

## Шаг 3: Проверка конфигурации Nginx

```bash
# Проверьте синтаксис конфигурации
sudo nginx -t

# Если всё в порядке, перезапустите Nginx
sudo systemctl restart nginx
```

## Шаг 4: Проверка SSL

```bash
# Проверьте, что SSL работает
curl -I https://aplus.tj

# Или откройте в браузере
# https://aplus.tj
```

## Важные замечания

1. **Безопасность ключа**: Приватный ключ должен быть доступен только root
2. **Резервное копирование**: Обязательно сделайте резервную копию сертификатов
3. **Срок действия**: Сертификат действителен до 2026-10-21. Не забудьте обновить его до истечения срока
4. **Проверка сертификата**: Убедитесь, что сертификат включает оба домена: aplus.tj и www.aplus.tj

## Содержимое файлов

### aplus.tj.key (приватный ключ)
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAuSzkxLLp78g1sMAAwT8c8YpOaTiEeUravvnq/Ece/UBQcz1P
...
-----END RSA PRIVATE KEY-----
```

### aplus.tj.crt (сертификат)
```
-----BEGIN CERTIFICATE-----
MIIDmjCCAoICCQDKQ0ZyAANmGjANBgkqhkiG9w0BAQsFADCBjjELMAkGA1UEBhMC
...
-----END CERTIFICATE-----
```

## Автоматическое обновление (для Let's Encrypt)

Если в будущем вы будете использовать Let's Encrypt, настройте автоматическое обновление:

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата (если нужно)
sudo certbot --nginx -d aplus.tj -d www.aplus.tj

# Автоматическое обновление
sudo certbot renew --dry-run
```

