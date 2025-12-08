@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   Запуск проекта Aero (БД отдельно)
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

REM Шаг 2: Пропуск проверки SSL (nginx отключен, используется HTTP)
echo [Шаг 2] Пропуск проверки SSL (используется HTTP)...
echo [OK] Nginx отключен, используется прямой HTTP доступ
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
docker-compose -f docker-compose.all.yml down >nul 2>&1
echo [OK] Старые контейнеры остановлены
echo.

REM Шаг 5: Сборка и запуск проекта
echo [Шаг 5] Сборка и запуск проекта...
echo [INFO] Это может занять несколько минут, пожалуйста подождите...
echo.

REM Остановка и удаление старых контейнеров перед пересборкой
echo [ОЧИСТКА] Удаление старых контейнеров...
docker-compose -f docker-compose.all.yml down >nul 2>&1

REM Пересборка и запуск проекта
echo [СБОРКА] Пересборка контейнера (это может занять время)...
docker-compose -f docker-compose.all.yml build --no-cache
if errorlevel 1 (
    echo [ОШИБКА] Ошибка при сборке!
    pause
    exit /b 1
)

REM Запуск контейнеров
echo [ЗАПУСК] Запуск всех сервисов...
docker-compose -f docker-compose.all.yml up -d

if errorlevel 1 (
    echo.
    echo [ОШИБКА] Не удалось запустить проект!
    echo.
    echo Проверьте логи:
    echo   docker-compose -f docker-compose.all.yml logs
    echo.
    pause
    exit /b 1
)

echo.
echo [ПРОВЕРКА] Ожидание запуска сервисов...
timeout /t 10 /nobreak >nul

REM Проверка статуса контейнеров
echo.
echo [ПРОВЕРКА] Статус контейнеров:
docker-compose -f docker-compose.all.yml ps

echo.
echo ========================================
echo   Проект успешно запущен!
echo ========================================
echo.
echo Структура контейнеров:
echo   - aero-postgres: База данных PostgreSQL
echo   - aero-app: Frontend + Backend (HTTP)
echo.
echo Доступ к приложению:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo [ИНФОРМАЦИЯ] Nginx отключен, используется прямой HTTP доступ
echo.
echo Полезные команды:
echo   - Логи всех сервисов: docker-compose -f docker-compose.all.yml logs -f
echo   - Логи app:           docker-compose -f docker-compose.all.yml logs -f app
echo   - Логи postgres:      docker-compose -f docker-compose.all.yml logs -f postgres
echo   - Остановка:          docker-compose -f docker-compose.all.yml down
echo   - Статус:            docker-compose -f docker-compose.all.yml ps
echo   - Перезапуск:        docker-compose -f docker-compose.all.yml restart
echo.
pause


