@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   Запуск проекта Aero (один контейнер)
echo ========================================
echo.

REM Шаг 1: Проверка наличия .env файла
echo [Шаг 1] Проверка .env файла...
if not exist .env (
    echo [СОЗДАНИЕ] .env файла...
    if exist env.docker.example (
        copy env.docker.example .env >nul
        echo [OK] Файл .env создан из env.docker.example
        echo [INFO] Проверьте и при необходимости отредактируйте .env файл
    ) else (
        echo [ОШИБКА] Файл env.docker.example не найден!
        pause
        exit /b 1
    )
) else (
    echo [OK] Файл .env уже существует
)
echo.

REM Шаг 2: Проверка и создание SSL сертификатов
echo [Шаг 2] Проверка SSL сертификатов...
if not exist nginx\ssl (
    echo [СОЗДАНИЕ] Директории nginx\ssl...
    mkdir nginx\ssl
)

if not exist nginx\ssl\cert.pem (
    echo [ВНИМАНИЕ] SSL сертификаты не найдены!
    echo [СОЗДАНИЕ] Попытка автоматического создания...
    echo.
    
    REM Пытаемся создать улучшенный сертификат через PowerShell
    if exist nginx\generate-ssl-improved.ps1 (
        powershell -NoProfile -ExecutionPolicy Bypass -File nginx\generate-ssl-improved.ps1
    ) else (
        REM Fallback на простой метод
        powershell -NoProfile -Command "if (Get-Command openssl -ErrorAction SilentlyContinue) { $null = openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem -subj '/C=BY/ST=Minsk/L=Minsk/O=BelAeronavigatsia/CN=localhost' 2>&1; if ($LASTEXITCODE -eq 0) { Write-Host '[OK] SSL сертификаты созданы' -ForegroundColor Green; exit 0 } else { Write-Host '[ОШИБКА] Ошибка при создании сертификатов' -ForegroundColor Red; exit 1 } } else { Write-Host '[ОШИБКА] OpenSSL не найден!' -ForegroundColor Red; Write-Host 'Установите OpenSSL или используйте Git Bash' -ForegroundColor Yellow; exit 1 }"
    )
    
    if errorlevel 1 (
        echo.
        echo [ОШИБКА] Не удалось создать SSL сертификаты автоматически!
        echo.
        echo Варианты решения:
        echo 1. Установите OpenSSL: choco install openssl
        echo 2. Используйте Git Bash: cd nginx ^&^& bash generate-ssl.sh
        echo 3. Или создайте вручную: cd nginx ^&^& .\generate-ssl.ps1
        echo.
        echo [ВАЖНО] Без SSL сертификатов HTTPS не будет работать!
        set /p continue="Продолжить все равно? (y/n): "
        if /i not "!continue!"=="y" (
            exit /b 1
        )
    ) else (
        echo [OK] SSL сертификаты успешно созданы
    )
) else (
    echo [OK] SSL сертификаты найдены
)
echo.

REM Шаг 3: Проверка Docker
echo [Шаг 3] Проверка Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Docker не установлен или не запущен!
    echo.
    echo Установите Docker Desktop и запустите его.
    echo Скачать: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('docker --version') do echo [OK] %%i
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Docker Compose не найден!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('docker-compose --version') do echo [OK] %%i
)
echo.

REM Шаг 4: Остановка старых контейнеров
echo [Шаг 4] Остановка старых контейнеров...
docker-compose -f docker-compose.single.yml down >nul 2>&1
echo [OK] Старые контейнеры остановлены
echo.

REM Шаг 5: Сборка и запуск проекта
echo [Шаг 5] Сборка и запуск проекта (один контейнер)...
echo [INFO] Это может занять несколько минут, пожалуйста подождите...
echo.

REM Остановка и удаление старых контейнеров перед пересборкой
echo [ОЧИСТКА] Удаление старых контейнеров...
docker-compose -f docker-compose.single.yml down >nul 2>&1

REM Пересборка и запуск проекта
echo [СБОРКА] Пересборка контейнера (это может занять время)...
docker-compose -f docker-compose.single.yml build --no-cache
if errorlevel 1 (
    echo [ОШИБКА] Ошибка при сборке!
    pause
    exit /b 1
)

REM Запуск контейнеров
echo [ЗАПУСК] Запуск всех сервисов...
docker-compose -f docker-compose.single.yml up -d

if errorlevel 1 (
    echo.
    echo [ОШИБКА] Не удалось запустить проект!
    echo.
    echo Проверьте логи:
    echo   docker-compose -f docker-compose.single.yml logs
    echo.
    pause
    exit /b 1
)

echo.
echo [ПРОВЕРКА] Ожидание запуска сервисов...
timeout /t 5 /nobreak >nul

REM Проверка статуса контейнеров
echo.
echo [ПРОВЕРКА] Статус контейнеров:
docker-compose -f docker-compose.single.yml ps

echo.
echo ========================================
echo   Проект успешно запущен!
echo ========================================
echo.
echo Доступ к приложению:
echo   HTTP:  http://localhost:8080
echo   HTTPS: https://localhost:8443
echo.
echo [ВАЖНО] Используйте HTTPS для доступа к приложению!
echo         HTTP автоматически перенаправит на HTTPS
echo.
echo Полезные команды:
echo   - Логи:      docker-compose -f docker-compose.single.yml logs -f
echo   - Остановка:  docker-compose -f docker-compose.single.yml down
echo   - Статус:    docker-compose -f docker-compose.single.yml ps
echo   - Перезапуск: docker-compose -f docker-compose.single.yml restart
echo.
pause

