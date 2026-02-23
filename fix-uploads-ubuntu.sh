#!/bin/bash
# Скрипт для исправления загрузки картинок на Ubuntu сервере

set -e

echo "=== Исправление загрузки картинок на Ubuntu сервере ==="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Ошибка: docker-compose.yml не найден. Запустите скрипт из корневой директории проекта.${NC}"
    exit 1
fi

echo "1. Остановка контейнеров..."
docker-compose stop frontend

echo ""
echo "2. Пересборка frontend контейнера..."
docker-compose build frontend

echo ""
echo "3. Запуск контейнеров..."
docker-compose up -d frontend

echo ""
echo "4. Ожидание запуска контейнеров..."
sleep 5

echo ""
echo "5. Проверка статуса контейнеров:"
docker ps --filter "name=aero" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "6. Проверка nginx конфигурации:"
if docker exec aero-frontend cat /etc/nginx/conf.d/default.conf | grep -q "proxy_pass http://aero-backend:3000/uploads/"; then
    echo -e "${GREEN}✓ Конфигурация nginx правильная${NC}"
else
    echo -e "${RED}✗ Конфигурация nginx неправильная!${NC}"
    docker exec aero-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location.*uploads"
fi

echo ""
echo "7. Проверка доступности backend из frontend:"
if docker exec aero-frontend ping -c 1 aero-backend > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend доступен из frontend${NC}"
else
    echo -e "${RED}✗ Backend НЕ доступен из frontend!${NC}"
fi

echo ""
echo "8. Проверка файлов в backend:"
FILE_COUNT=$(docker exec aero-backend sh -c "ls /app/uploads/ 2>/dev/null | wc -l" | tr -d ' ')
if [ "$FILE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Найдено файлов в /app/uploads/: $FILE_COUNT${NC}"
    docker exec aero-backend ls /app/uploads/ | head -5
else
    echo -e "${YELLOW}⚠ Файлы в /app/uploads/ не найдены${NC}"
fi

echo ""
echo "9. Тест загрузки файла через backend:"
TEST_FILE=$(docker exec aero-backend sh -c "ls /app/uploads/*.jpg 2>/dev/null | head -1" | xargs basename 2>/dev/null || echo "")
if [ -n "$TEST_FILE" ]; then
    HTTP_CODE=$(docker exec aero-frontend wget -q -O- --spider http://aero-backend:3000/uploads/$TEST_FILE 2>&1 | grep -o "HTTP/[0-9.]* [0-9]*" | awk '{print $2}' || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Тестовый файл доступен через backend: $TEST_FILE${NC}"
    else
        echo -e "${RED}✗ Тестовый файл НЕ доступен (HTTP $HTTP_CODE): $TEST_FILE${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Тестовый файл не найден${NC}"
fi

echo ""
echo "10. Проверка логов frontend (последние ошибки):"
docker logs aero-frontend --tail 20 2>&1 | grep -i "error\|404\|failed" | tail -5 || echo "Нет ошибок в логах"

echo ""
echo "11. Проверка логов backend (запросы к uploads):"
docker logs aero-backend --tail 20 2>&1 | grep -i "uploads\|serving static" | tail -5 || echo "Нет запросов к uploads в последних логах"

echo ""
echo "=== Проверка завершена ==="
echo ""
echo "Если проблемы остались:"
echo "1. Проверьте логи: docker logs aero-frontend --tail 50"
echo "2. Проверьте логи: docker logs aero-backend --tail 50"
echo "3. Проверьте сеть: docker network inspect aero_aero-network"
echo "4. Проверьте конфигурацию: docker exec aero-frontend cat /etc/nginx/conf.d/default.conf"

