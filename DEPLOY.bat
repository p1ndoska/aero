@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   Полный деплой проекта Aero в Docker
echo   (БД с нуля, миграции, скрипты, HTTPS)
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
    
    REM Пытаемся создать через PowerShell
    powershell -NoProfile -Command "if (Get-Command openssl -ErrorAction SilentlyContinue) { $null = openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem -subj '/C=BY/ST=Minsk/L=Minsk/O=Aero/CN=localhost' 2>&1; if ($LASTEXITCODE -eq 0) { Write-Host '[OK] SSL сертификаты созданы' -ForegroundColor Green; exit 0 } else { Write-Host '[ОШИБКА] Ошибка при создании сертификатов' -ForegroundColor Red; exit 1 } } else { Write-Host '[ОШИБКА] OpenSSL не найден!' -ForegroundColor Red; Write-Host 'Установите OpenSSL или используйте Git Bash' -ForegroundColor Yellow; exit 1 }"
    
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

REM Шаг 4: Вопрос о пересоздании БД
echo [Шаг 4] Выбор режима работы с БД...
echo.
echo Выберите режим:
echo   1. Создать БД с нуля (удалить старые данные)
echo   2. Использовать существующую БД (применить только миграции)
echo.
set /p db_mode="Введите номер (1 или 2, по умолчанию 2): "
if "!db_mode!"=="" set db_mode=2
if "!db_mode!"=="1" (
    echo [ВНИМАНИЕ] Будет удалена существующая БД и все данные!
    set /p confirm="Вы уверены? (yes/no): "
    if /i not "!confirm!"=="yes" (
        echo [ОТМЕНА] Операция отменена
        exit /b 0
    )
    echo [ОЧИСТКА] Удаление старых контейнеров и volumes...
    docker-compose down -v >nul 2>&1
    echo [OK] Старые контейнеры и volumes удалены
) else (
    echo [ОЧИСТКА] Остановка старых контейнеров...
    docker-compose down >nul 2>&1
    echo [OK] Старые контейнеры остановлены
)
echo.

REM Шаг 5: Запуск PostgreSQL
echo [Шаг 5] Запуск PostgreSQL...
echo [ЗАПУСК] Запуск контейнера базы данных...
docker-compose up -d postgres
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить PostgreSQL!
    pause
    exit /b 1
)

echo [ОЖИДАНИЕ] Ожидание готовности PostgreSQL...
:wait_postgres
timeout /t 2 /nobreak >nul
docker-compose exec -T postgres pg_isready -U prisma >nul 2>&1
if errorlevel 1 (
    echo [ОЖИДАНИЕ] PostgreSQL еще не готов, ждем...
    goto wait_postgres
)
echo [OK] PostgreSQL готов к работе
echo.

REM Шаг 6: Сборка backend и frontend
echo [Шаг 6] Сборка контейнеров...
echo [INFO] Это может занять несколько минут, пожалуйста подождите...
echo.

echo [СБОРКА] Сборка backend контейнера...
docker-compose build --no-cache backend
if errorlevel 1 (
    echo [ОШИБКА] Ошибка при сборке backend!
    pause
    exit /b 1
)

echo [СБОРКА] Сборка frontend контейнера...
docker-compose build --no-cache frontend
if errorlevel 1 (
    echo [ОШИБКА] Ошибка при сборке frontend!
    pause
    exit /b 1
)
echo [OK] Все контейнеры собраны
echo.

REM Шаг 7: Запуск backend (применение миграций и скриптов)
echo [Шаг 7] Запуск backend (миграции и инициализация)...
echo [ЗАПУСК] Запуск backend контейнера...
echo [INFO] Backend автоматически:
echo        - Проверит/создаст БД
echo        - Применит все миграции
echo        - Запустит все скрипты инициализации
echo        - Запустит сервер
echo.

docker-compose up -d backend
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить backend!
    pause
    exit /b 1
)

echo [ОЖИДАНИЕ] Ожидание применения миграций и инициализации БД...
echo [INFO] Это может занять 30-60 секунд...
timeout /t 10 /nobreak >nul

REM Проверяем логи backend на наличие ошибок
:check_backend
docker-compose logs --tail=50 backend | findstr /C:"База данных успешно инициализирована" >nul 2>&1
if errorlevel 1 (
    docker-compose logs --tail=10 backend | findstr /C:"ERROR" /C:"ОШИБКА" /C:"error" >nul 2>&1
    if not errorlevel 1 (
        echo [ОШИБКА] Обнаружены ошибки в логах backend!
        echo.
        echo Последние логи:
        docker-compose logs --tail=20 backend
        echo.
        set /p continue="Продолжить все равно? (y/n): "
        if /i not "!continue!"=="y" (
            exit /b 1
        )
    ) else (
        timeout /t 5 /nobreak >nul
        goto check_backend
    )
) else (
    echo [OK] База данных успешно инициализирована
)
echo.

REM Шаг 8: Запуск frontend
echo [Шаг 8] Запуск frontend...
docker-compose up -d frontend
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить frontend!
    pause
    exit /b 1
)
echo [OK] Frontend запущен
echo.

REM Шаг 9: Проверка статуса
echo [Шаг 9] Проверка статуса контейнеров...
timeout /t 5 /nobreak >nul
echo.
docker-compose ps
echo.

REM Шаг 10: Проверка логов на ошибки
echo [Шаг 10] Проверка логов на ошибки...
docker-compose logs --tail=20 backend | findstr /C:"ERROR" /C:"ОШИБКА" /C:"error" >nul 2>&1
if not errorlevel 1 (
    echo [ВНИМАНИЕ] Обнаружены ошибки в логах backend!
    echo Посмотрите логи: docker-compose logs backend
) else (
    echo [OK] Критических ошибок не обнаружено
)
echo.

echo ========================================
echo   Проект успешно развернут!
echo ========================================
echo.
echo Доступ к приложению:
echo   HTTP:  http://localhost:8080
echo   HTTPS: https://localhost:8443
echo.
echo [ВАЖНО] Используйте HTTPS для доступа к приложению!
echo         HTTP автоматически перенаправит на HTTPS
echo.
echo Информация о БД:
echo   - База данных: mydb
echo   - Пользователь: prisma
echo   - Хост: postgres (внутри Docker)
echo   - Порт: 5432 (внутри Docker)
echo.
echo Все миграции применены:
for /f "tokens=*" %%i in ('dir /b /ad backend\prisma\migrations') do (
    if not "%%i"=="migration_lock.toml" (
        echo   - %%i
    )
)
echo.
echo Все скрипты инициализации выполнены:
echo   - ensure-database.js (проверка/создание БД)
echo   - prisma migrate deploy (применение миграций)
echo   - initialize-db.js (инициализация данных)
echo     - seedRolesAndSuperAdmin
echo     - seedNewsCategories
echo     - seedAboutCompanyCategories
echo     - seedSocialWorkCategories
echo     - seedAeronauticalInfoCategories
echo     - seedAppealsCategories
echo     - seedServicesCategories
echo     - updateAboutCompanyPageContentTitles
echo     - updateSocialWorkPageContentTitles
echo.
echo Полезные команды:
echo   - Логи всех сервисов: docker-compose logs -f
echo   - Логи frontend:      docker-compose logs -f frontend
echo   - Логи backend:       docker-compose logs -f backend
echo   - Логи postgres:      docker-compose logs -f postgres
echo   - Остановка:          docker-compose down
echo   - Остановка + volumes: docker-compose down -v
echo   - Статус:             docker-compose ps
echo   - Перезапуск:         docker-compose restart
echo   - Перезапуск backend: docker-compose restart backend
echo.
echo Для просмотра логов инициализации БД:
echo   docker-compose logs backend | findstr /C:"Шаг"
echo.
pause

