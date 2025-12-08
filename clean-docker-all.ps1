# Скрипт для ПОЛНОЙ очистки Docker (удаляет ВСЁ!)
Write-Host "========================================" -ForegroundColor Red
Write-Host "  ПОЛНАЯ ОЧИСТКА DOCKER" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  ВНИМАНИЕ: Эта команда удалит ВСЁ!" -ForegroundColor Red
Write-Host "   - Все контейнеры (включая запущенные)" -ForegroundColor Yellow
Write-Host "   - Все образы" -ForegroundColor Yellow
Write-Host "   - Все volumes (данные БД!)" -ForegroundColor Yellow
Write-Host "   - Все сети" -ForegroundColor Yellow
Write-Host "   - Весь build cache" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Вы УВЕРЕНЫ? Введите 'YES' для подтверждения"
if ($confirm -ne "YES") {
    Write-Host "Очистка отменена." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Остановка всех контейнеров..." -ForegroundColor Yellow
docker stop $(docker ps -aq) 2>&1 | Out-Null

Write-Host "Удаление всех контейнеров..." -ForegroundColor Yellow
docker rm $(docker ps -aq) 2>&1 | Out-Null

Write-Host "Удаление всех образов..." -ForegroundColor Yellow
docker rmi $(docker images -q) -f 2>&1 | Out-Null

Write-Host "Удаление всех volumes..." -ForegroundColor Yellow
docker volume rm $(docker volume ls -q) 2>&1 | Out-Null

Write-Host "Удаление всех сетей..." -ForegroundColor Yellow
docker network prune -f 2>&1 | Out-Null

Write-Host "Очистка build cache..." -ForegroundColor Yellow
docker builder prune -a -f 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Полная очистка завершена!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Использование дискового пространства:" -ForegroundColor Yellow
docker system df
Write-Host ""

