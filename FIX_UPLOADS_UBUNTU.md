# Инструкция по исправлению загрузки картинок на Ubuntu сервере

## Проблема
Картинки не загружаются при доступе по DNS на Ubuntu сервере.

## Быстрое решение

### Автоматическое исправление (рекомендуется)

1. Скопируйте файл `fix-uploads-ubuntu.sh` на сервер
2. Сделайте его исполняемым и запустите:
```bash
chmod +x fix-uploads-ubuntu.sh
./fix-uploads-ubuntu.sh
```

Скрипт автоматически:
- Пересоберет frontend контейнер
- Перезапустит контейнеры
- Проверит конфигурацию
- Выведет диагностическую информацию

### Ручное исправление

#### 1. Обновите файлы на сервере

Скопируйте следующие файлы на сервер:
- `frontend/src/constants.ts` - исправлена логика BASE_URL (использует window.location.origin)
- `frontend/nginx.conf` - исправлена конфигурация nginx (проксирование на aero-backend)
- `docker-compose.yml` - обновлена конфигурация

#### 2. Пересоберите и перезапустите контейнеры

```bash
cd /path/to/aero

# Остановите frontend
docker-compose stop frontend

# Пересоберите с новым кодом
docker-compose build frontend

# Запустите
docker-compose up -d frontend

# Проверьте статус
docker ps --filter "name=aero"
```

### 3. Проверьте конфигурацию

```bash
# Проверьте, что контейнеры запущены
docker ps --filter "name=aero"

# Проверьте nginx конфигурацию
docker exec aero-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location.*uploads"

# Должно быть:
# location ^~ /uploads/ {
#     proxy_pass http://aero-backend:3000/uploads/;
#     ...
# }
```

### 4. Проверьте доступность backend из frontend

```bash
# Проверка сети
docker exec aero-frontend ping -c 2 aero-backend

# Проверка доступности API
docker exec aero-frontend wget -q -O- http://aero-backend:3000/api/health

# Проверка доступности uploads
docker exec aero-frontend wget -q -O- http://aero-backend:3000/uploads/ 2>&1 | head -1
```

### 5. Проверьте логи

```bash
# Логи frontend
docker logs aero-frontend --tail 50 | grep -i "uploads\|error\|404"

# Логи backend
docker logs aero-backend --tail 50 | grep -i "uploads\|serving\|static"
```

### 6. Проверьте файлы в backend

```bash
# Убедитесь, что файлы есть
docker exec aero-backend ls -la /app/uploads/ | head -10

# Проверьте конкретный файл
docker exec aero-backend test -f /app/uploads/photo-1770832998452-473452015.jpg && echo "File exists" || echo "File NOT found"
```

### 7. Проверьте в браузере

1. Откройте консоль разработчика (F12)
2. Перейдите на вкладку Network
3. Попробуйте загрузить страницу с картинками
4. Проверьте запросы к `/uploads/...`
5. Посмотрите на URL запросов - они должны быть вида `https://ваш-домен:8443/uploads/...`

### 8. Если проблема осталась

Проверьте:
- Правильно ли работает DNS (проверьте `nslookup ваш-домен`)
- Доступен ли порт 8443 извне
- Правильно ли настроен firewall
- Работает ли HTTPS (проверьте сертификаты)

### 9. Дополнительная диагностика

Запустите скрипт проверки:
```bash
chmod +x check-uploads.sh
./check-uploads.sh
```

## Важные изменения

1. **BASE_URL** теперь автоматически определяется из `window.location.origin` в production
2. **nginx.conf** проксирует `/uploads/` на `http://aero-backend:3000/uploads/`
3. **docker-compose.yml** не использует захардкоженный VITE_API_URL

