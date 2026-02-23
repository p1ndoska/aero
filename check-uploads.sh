#!/bin/bash
# Скрипт для проверки работы загрузки файлов на сервере

echo "=== Проверка конфигурации загрузки файлов ==="
echo ""

echo "1. Проверка контейнеров:"
docker ps --filter "name=aero" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2. Проверка сети между контейнерами:"
docker exec aero-frontend ping -c 2 aero-backend 2>&1 | head -3
echo ""

echo "3. Проверка доступности backend из frontend:"
docker exec aero-frontend wget -q -O- http://aero-backend:3000/api/health 2>&1 | head -1
echo ""

echo "4. Проверка файлов в backend:"
docker exec aero-backend ls -la /app/uploads/ | head -5
echo ""

echo "5. Проверка nginx конфигурации frontend:"
docker exec aero-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location.*uploads"
echo ""

echo "6. Тест загрузки файла через nginx:"
docker exec aero-frontend wget -q -O- http://aero-backend:3000/uploads/ 2>&1 | head -1
echo ""

echo "7. Логи frontend (последние 10 строк):"
docker logs aero-frontend --tail 10 2>&1 | grep -i "uploads\|error\|404" || echo "Нет ошибок в логах"
echo ""

echo "8. Логи backend (последние 10 строк):"
docker logs aero-backend --tail 10 2>&1 | grep -i "uploads\|serving\|static" || echo "Нет запросов к uploads"
echo ""

echo "=== Проверка завершена ==="

