@echo off
chcp 65001 >nul
echo ========================================
echo   ПОЛНАЯ ОЧИСТКА DOCKER
echo ========================================
echo.
echo ⚠️  ВНИМАНИЕ: Эта команда удалит ВСЁ!
echo    - Все контейнеры (включая запущенные)
echo    - Все образы
echo    - Все volumes (данные БД!)
echo    - Все сети
echo    - Весь build cache
echo.

set /p confirm="Вы УВЕРЕНЫ? Введите 'YES' для подтверждения: "
if /i not "%confirm%"=="YES" (
    echo Очистка отменена.
    pause
    exit /b 0
)

echo.
echo Остановка всех контейнеров...
for /f %%i in ('docker ps -aq') do docker stop %%i >nul 2>&1

echo Удаление всех контейнеров...
for /f %%i in ('docker ps -aq') do docker rm %%i >nul 2>&1

echo Удаление всех образов...
for /f %%i in ('docker images -q') do docker rmi %%i -f >nul 2>&1

echo Удаление всех volumes...
for /f %%i in ('docker volume ls -q') do docker volume rm %%i >nul 2>&1

echo Удаление всех сетей...
docker network prune -f >nul 2>&1

echo Очистка build cache...
docker builder prune -a -f >nul 2>&1

echo.
echo ========================================
echo   Полная очистка завершена!
echo ========================================
echo.
echo Использование дискового пространства:
docker system df
echo.
pause

