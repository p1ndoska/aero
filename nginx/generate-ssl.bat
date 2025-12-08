@echo off
echo Создание SSL сертификатов для разработки...
echo.

REM Создаем директорию если нет
if not exist ssl mkdir ssl

REM Проверяем наличие OpenSSL
where openssl >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] OpenSSL не найден!
    echo.
    echo Установите OpenSSL одним из способов:
    echo 1. Chocolatey: choco install openssl
    echo 2. Или используйте Git Bash: bash generate-ssl.sh
    echo 3. Или используйте PowerShell: .\generate-ssl.ps1
    pause
    exit /b 1
)

REM Создаем сертификаты
echo Создание сертификатов...
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\key.pem -out ssl\cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

if errorlevel 1 (
    echo [ОШИБКА] Не удалось создать сертификаты!
    pause
    exit /b 1
)

echo.
echo [OK] SSL сертификаты созданы в nginx\ssl\
echo Для production замените их на реальные сертификаты от Let's Encrypt
echo.
pause

