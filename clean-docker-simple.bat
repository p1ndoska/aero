@echo off
chcp 65001 >nul
echo ========================================
echo   Быстрая очистка Docker
echo ========================================
echo.

REM Остановка проекта
if exist docker-compose.yml (
    echo Остановка проекта aero...
    docker-compose down -v
    echo.
)

REM Полная очистка неиспользуемых ресурсов
echo Очистка всех неиспользуемых ресурсов...
docker system prune -a --volumes -f

echo.
echo ========================================
echo   Очистка завершена!
echo ========================================
echo.
echo Использование дискового пространства:
docker system df
echo.
pause

