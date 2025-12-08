# PowerShell скрипт для запуска проекта
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Запуск проекта Aero в Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Проверка и создание .env файла
Write-Host "[Шаг 1] Проверка .env файла..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path "env.docker.example") {
        Copy-Item "env.docker.example" ".env"
        Write-Host "[OK] Файл .env создан из env.docker.example" -ForegroundColor Green
    } else {
        Write-Host "[ОШИБКА] Файл env.docker.example не найден!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Файл .env уже существует" -ForegroundColor Green
}
Write-Host ""

# Шаг 2: Проверка SSL сертификатов
Write-Host "[Шаг 2] Проверка SSL сертификатов..." -ForegroundColor Yellow
if (-not (Test-Path "nginx\ssl\cert.pem")) {
    Write-Host "[ВНИМАНИЕ] SSL сертификаты не найдены!" -ForegroundColor Yellow
    Write-Host "Создаю SSL сертификаты..." -ForegroundColor Yellow
    
    if (-not (Test-Path "nginx\ssl")) {
        New-Item -ItemType Directory -Path "nginx\ssl" | Out-Null
    }
    
    $openssl = Get-Command openssl -ErrorAction SilentlyContinue
    if ($openssl) {
        Push-Location "nginx"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
            -keyout ssl/key.pem `
            -out ssl/cert.pem `
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        Pop-Location
        Write-Host "[OK] SSL сертификаты созданы" -ForegroundColor Green
    } else {
        Write-Host "[ОШИБКА] OpenSSL не найден!" -ForegroundColor Red
        Write-Host "Установите OpenSSL или используйте Git Bash для запуска generate-ssl.sh" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Продолжить без SSL? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
} else {
    Write-Host "[OK] SSL сертификаты найдены" -ForegroundColor Green
}
Write-Host ""

# Шаг 3: Проверка Docker
Write-Host "[Шаг 3] Проверка Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "[OK] Docker найден: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ОШИБКА] Docker не установлен или не запущен!" -ForegroundColor Red
    Write-Host "Установите Docker Desktop и запустите его." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Шаг 4: Остановка старых контейнеров
Write-Host "[Шаг 4] Остановка старых контейнеров..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "[OK] Старые контейнеры остановлены" -ForegroundColor Green
Write-Host ""

# Шаг 5: Сборка и запуск
Write-Host "[Шаг 5] Сборка и запуск проекта..." -ForegroundColor Yellow
Write-Host "Это может занять несколько минут..." -ForegroundColor Gray
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ОШИБКА] Не удалось запустить проект!" -ForegroundColor Red
    Write-Host "Проверьте логи: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Проект успешно запущен!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Откройте в браузере: " -NoNewline
Write-Host "https://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Полезные команды:" -ForegroundColor Yellow
Write-Host "  - Логи: docker-compose logs -f" -ForegroundColor Gray
Write-Host "  - Остановка: docker-compose down" -ForegroundColor Gray
Write-Host "  - Статус: docker-compose ps" -ForegroundColor Gray
Write-Host "  - Перезапуск: docker-compose restart" -ForegroundColor Gray
Write-Host ""

