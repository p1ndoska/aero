@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   Установка SSL сертификата
echo   для убирания предупреждения "Не защищено"
echo ========================================
echo.

REM Проверка наличия сертификата
if not exist nginx\ssl\cert.pem (
    echo [ОШИБКА] Сертификат не найден!
    echo.
    echo Сначала создайте сертификат:
    echo   cd nginx
    echo   .\generate-ssl-improved.ps1
    echo   cd ..
    echo.
    pause
    exit /b 1
)

echo [INFO] Найден сертификат: nginx\ssl\cert.pem
echo.
echo [ВАЖНО] Для установки сертификата нужны права администратора!
echo.
echo Запускаю PowerShell от имени администратора...
echo.

REM Запуск PowerShell скрипта от имени администратора
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0nginx\install-certificate.ps1\"'"

echo.
echo [INFO] Если окно PowerShell открылось, следуйте инструкциям.
echo [INFO] После установки перезапустите браузер.
echo.
pause




