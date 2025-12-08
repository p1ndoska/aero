# Скрипт для очистки Docker
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Очистка Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка текущей директории
$currentDir = Get-Location
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ВНИМАНИЕ] docker-compose.yml не найден в текущей директории" -ForegroundColor Yellow
    Write-Host "Текущая директория: $currentDir" -ForegroundColor Gray
    $continue = Read-Host "Продолжить очистку? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

# Шаг 1: Остановка проекта aero (если есть)
Write-Host "[Шаг 1] Остановка проекта aero..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    docker-compose down -v 2>&1 | Out-Null
    Write-Host "[OK] Проект остановлен" -ForegroundColor Green
} else {
    Write-Host "[Пропущено] docker-compose.yml не найден" -ForegroundColor Gray
}
Write-Host ""

# Шаг 2: Удаление остановленных контейнеров
Write-Host "[Шаг 2] Удаление остановленных контейнеров..." -ForegroundColor Yellow
$containers = docker container prune -f 2>&1
Write-Host "[OK] Остановленные контейнеры удалены" -ForegroundColor Green
Write-Host ""

# Шаг 3: Удаление неиспользуемых образов
Write-Host "[Шаг 3] Удаление неиспользуемых образов..." -ForegroundColor Yellow
$images = docker image prune -a -f 2>&1
Write-Host "[OK] Неиспользуемые образы удалены" -ForegroundColor Green
Write-Host ""

# Шаг 4: Удаление неиспользуемых volumes
Write-Host "[Шаг 4] Удаление неиспользуемых volumes..." -ForegroundColor Yellow
Write-Host "[ВНИМАНИЕ] Это удалит все данные БД!" -ForegroundColor Red
$continue = Read-Host "Продолжить? (y/n)"
if ($continue -eq "y") {
    $volumes = docker volume prune -f 2>&1
    Write-Host "[OK] Неиспользуемые volumes удалены" -ForegroundColor Green
} else {
    Write-Host "[Пропущено] Удаление volumes отменено" -ForegroundColor Gray
}
Write-Host ""

# Шаг 5: Удаление неиспользуемых сетей
Write-Host "[Шаг 5] Удаление неиспользуемых сетей..." -ForegroundColor Yellow
$networks = docker network prune -f 2>&1
Write-Host "[OK] Неиспользуемые сети удалены" -ForegroundColor Green
Write-Host ""

# Шаг 6: Очистка build cache
Write-Host "[Шаг 6] Очистка build cache..." -ForegroundColor Yellow
$cache = docker builder prune -a -f 2>&1
Write-Host "[OK] Build cache очищен" -ForegroundColor Green
Write-Host ""

# Итоговая статистика
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Очистка завершена!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Использование дискового пространства:" -ForegroundColor Yellow
docker system df
Write-Host ""

