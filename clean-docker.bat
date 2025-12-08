@echo off
chcp 65001 >nul
echo ========================================
echo   Очистка Docker
echo ========================================
echo.

REM Проверка текущей директории
if not exist docker-compose.yml (
    echo [ВНИМАНИЕ] docker-compose.yml не найден в текущей директории
    echo Текущая директория: %CD%
    set /p continue="Продолжить очистку? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 0
    )
)

REM Шаг 1: Остановка проекта aero (если есть)
echo [Шаг 1] Остановка проекта aero...
if exist docker-compose.yml (
    docker-compose down -v >nul 2>&1
    echo [OK] Проект остановлен
) else (
    echo [Пропущено] docker-compose.yml не найден
)
echo.

REM Шаг 2: Удаление остановленных контейнеров
echo [Шаг 2] Удаление остановленных контейнеров...
docker container prune -f >nul 2>&1
echo [OK] Остановленные контейнеры удалены
echo.

REM Шаг 3: Удаление неиспользуемых образов
echo [Шаг 3] Удаление неиспользуемых образов...
docker image prune -a -f >nul 2>&1
echo [OK] Неиспользуемые образы удалены
echo.

REM Шаг 4: Удаление неиспользуемых volumes
echo [Шаг 4] Удаление неиспользуемых volumes...
echo [ВНИМАНИЕ] Это удалит все данные БД!
set /p continue="Продолжить? (y/n): "
if /i "%continue%"=="y" (
    docker volume prune -f >nul 2>&1
    echo [OK] Неиспользуемые volumes удалены
) else (
    echo [Пропущено] Удаление volumes отменено
)
echo.

REM Шаг 5: Удаление неиспользуемых сетей
echo [Шаг 5] Удаление неиспользуемых сетей...
docker network prune -f >nul 2>&1
echo [OK] Неиспользуемые сети удалены
echo.

REM Шаг 6: Очистка build cache
echo [Шаг 6] Очистка build cache...
docker builder prune -a -f >nul 2>&1
echo [OK] Build cache очищен
echo.

REM Итоговая статистика
echo ========================================
echo   Очистка завершена!
echo ========================================
echo.
echo Использование дискового пространства:
docker system df
echo.
pause

