# Исправление загрузки картинок на Ubuntu сервере

## Проблема
На Ubuntu сервере картинки не загружаются при доступе по DNS, хотя на localhost все работает.

## Причина
Контейнер frontend не пересобран с обновленным кодом, который использует `window.location.origin` для автоматического определения домена.

## Решение

### Шаг 1: Обновите файлы на сервере

Убедитесь, что на сервере есть обновленные версии файлов:
- ✅ `frontend/src/constants.ts` - использует `window.location.origin` в production
- ✅ `frontend/nginx.conf` - проксирует `/uploads/` на `http://aero-backend:3000/uploads/`
- ✅ `docker-compose.yml` - не использует захардкоженный VITE_API_URL

### Шаг 2: Пересоберите frontend контейнер

**ВАЖНО**: Контейнер нужно пересобрать, так как код компилируется при сборке!

```bash
cd /path/to/aero

# Остановите frontend
docker-compose stop frontend

# Пересоберите с новым кодом
docker-compose build --no-cache frontend

# Запустите
docker-compose up -d frontend

# Проверьте статус
docker ps --filter "name=aero-frontend"
```

### Шаг 3: Проверьте конфигурацию

```bash
# Проверьте nginx конфигурацию
docker exec aero-frontend cat /etc/nginx/conf.d/default.conf | grep -A 8 "location.*uploads"

# Должно быть:
# location ^~ /uploads/ {
#     proxy_pass http://aero-backend:3000/uploads/;
#     ...
# }
```

### Шаг 4: Проверьте доступность backend

```bash
# Проверка сети между контейнерами
docker exec aero-frontend ping -c 2 aero-backend

# Проверка доступности backend API
docker exec aero-frontend wget -q -O- http://aero-backend:3000/api/health
```

### Шаг 5: Проверьте логи

```bash
# Логи frontend (ищите ошибки 404 для /uploads/)
docker logs aero-frontend --tail 50 | grep -i "uploads\|404\|error"

# Логи backend (должны быть запросы к /uploads/)
docker logs aero-backend --tail 50 | grep -i "uploads\|serving static"
```

### Шаг 6: Проверьте в браузере

1. Откройте сайт по DNS
2. Откройте консоль разработчика (F12)
3. Перейдите на вкладку Network
4. Обновите страницу (Ctrl+F5)
5. Найдите запросы к `/uploads/...`
6. Проверьте:
   - URL должен быть вида `https://ваш-домен:8443/uploads/photo-xxx.jpg`
   - НЕ должен быть `https://localhost:8443/uploads/...`
   - Статус должен быть 200, а не 404

## Автоматическая проверка

Используйте скрипт для автоматической проверки:

```bash
chmod +x fix-uploads-ubuntu.sh
./fix-uploads-ubuntu.sh
```

## Если проблема осталась

### Проверка 1: BASE_URL в браузере

Откройте консоль браузера (F12) и выполните:
```javascript
console.log('BASE_URL:', window.location.origin);
```

Должно вывести ваш DNS домен, например: `https://aero.ban.by:8443`

### Проверка 2: Сеть Docker

```bash
# Проверьте сеть
docker network inspect aero_aero-network | grep -A 5 "aero-backend\|aero-frontend"

# Проверьте, что контейнеры в одной сети
docker inspect aero-frontend | grep -A 10 "Networks"
docker inspect aero-backend | grep -A 10 "Networks"
```

### Проверка 3: Файлы в backend

```bash
# Убедитесь, что файлы есть
docker exec aero-backend ls -la /app/uploads/ | head -10

# Проверьте конкретный файл из ошибки браузера
docker exec aero-backend test -f /app/uploads/photo-1770832998452-473452015.jpg && echo "OK" || echo "NOT FOUND"
```

### Проверка 4: Прямой доступ к backend

```bash
# Попробуйте загрузить файл напрямую через backend
docker exec aero-backend wget -q -O- http://localhost:3000/uploads/photo-1770832998452-473452015.jpg 2>&1 | head -1
```

## Важные моменты

1. **Обязательно пересоберите контейнер** - код компилируется при сборке, просто перезапуск не поможет
2. **Очистите кэш браузера** - старый JavaScript может использовать старый BASE_URL
3. **Проверьте DNS** - убедитесь, что DNS правильно резолвится на сервер
4. **Проверьте порты** - порт 8443 должен быть открыт в firewall

## Контакты

Если проблема не решена, соберите следующую информацию:
```bash
# Сохраните вывод в файл
./fix-uploads-ubuntu.sh > diagnostics.txt 2>&1
docker logs aero-frontend --tail 100 >> diagnostics.txt
docker logs aero-backend --tail 100 >> diagnostics.txt
```

