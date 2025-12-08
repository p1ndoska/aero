@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
echo ========================================
echo   Zapusk proekta Aero v Docker
echo   BD, migracii, skripty, HTTPS nginx
echo ========================================
echo.

REM Shag 1: Proverka .env fayla
echo [Shag 1] Proverka .env fayla...
if not exist .env (
    echo [SOZDANIE] .env fayla...
    if exist env.docker.example (
        copy env.docker.example .env >nul
        echo [OK] Fayl .env sozdan iz env.docker.example
        echo [INFO] Proverte i pri neobhodimosti otredaktiruyte .env fayl
    ) else (
        echo [OSHIBKA] Fayl env.docker.example ne nayden!
        pause
        exit /b 1
    )
) else (
    echo [OK] Fayl .env uzhe sushestvuet
)
echo.

REM Shag 2: Proverka i sozdanie SSL sertifikatov
echo [Shag 2] Proverka SSL sertifikatov...
if not exist nginx\ssl (
    echo [SOZDANIE] Direktorii nginx\ssl...
    mkdir nginx\ssl
)

if not exist nginx\ssl\cert.pem (
    echo [VNIMANIE] SSL sertifikaty ne naydeny!
    echo [SOZDANIE] Popytka avtomaticheskogo sozdaniya...
    echo.
    
    REM Pytayemsya sozdat uluchshennyy sertifikat cherez PowerShell
    if exist nginx\generate-ssl-improved.ps1 (
        powershell -NoProfile -ExecutionPolicy Bypass -File nginx\generate-ssl-improved.ps1
    ) else (
        REM Fallback na prostoy metod
        powershell -NoProfile -Command "if (Get-Command openssl -ErrorAction SilentlyContinue) { $null = openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem -subj '/C=BY/ST=Minsk/L=Minsk/O=BelAeronavigatsia/CN=localhost' 2>&1; if ($LASTEXITCODE -eq 0) { Write-Host '[OK] SSL sertifikaty sozdany' -ForegroundColor Green; exit 0 } else { Write-Host '[OSHIBKA] Oshibka pri sozdanii sertifikatov' -ForegroundColor Red; exit 1 } } else { Write-Host '[OSHIBKA] OpenSSL ne nayden!' -ForegroundColor Red; Write-Host 'Ustanovite OpenSSL ili ispolzuyte Git Bash' -ForegroundColor Yellow; exit 1 }"
    )
    
    if errorlevel 1 (
        echo.
        echo [OSHIBKA] Ne udalos sozdat SSL sertifikaty avtomaticheski!
        echo.
        echo Varianty resheniya:
        echo 1. Ustanovite OpenSSL: choco install openssl
        echo 2. Ispolzuyte Git Bash: cd nginx ^&^& bash generate-ssl.sh
        echo 3. Ili sozdayte vruchnuyu: cd nginx ^&^& .\generate-ssl.ps1
        echo.
        echo [VAZHNO] Bez SSL sertifikatov HTTPS ne budet rabotat!
        set /p continue="Prodolzhit vse ravno? (y/n): "
        if /i not "!continue!"=="y" (
            exit /b 1
        )
    ) else (
        echo [OK] SSL sertifikaty uspeshno sozdany
    )
) else (
    echo [OK] SSL sertifikaty naydeny
)
echo.

REM Shag 3: Proverka Docker
echo [Shag 3] Proverka Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [OSHIBKA] Docker ne ustanovlen ili ne zapushchen!
    echo.
    echo Ustanovite Docker Desktop i zapustite ego.
    echo Skachat: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('docker --version') do echo [OK] %%i
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [OSHIBKA] Docker Compose ne nayden!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('docker-compose --version') do echo [OK] %%i
)
echo.

REM Shag 4: Proverka konteynerov
echo [Shag 4] Proverka sushestvuyushchih konteynerov...
docker-compose -f docker-compose.https.yml ps -q >nul 2>&1
if errorlevel 1 (
    echo [INFO] Konteynery ne naydeny, budut sozdany novye
) else (
    echo [INFO] Naydeny sushestvuyushchie konteynery, oni budut obnovleny pri neobhodimosti
)
echo.

REM Shag 5: Zapusk PostgreSQL
echo [Shag 5] Zapusk PostgreSQL...
echo [ZAPUSK] Zapusk/obnovlenie konteynera bazy dannyh...
docker-compose -f docker-compose.https.yml up -d postgres
if errorlevel 1 (
    echo [OSHIBKA] Ne udalos zapustit PostgreSQL!
    pause
    exit /b 1
)

echo [OZHIDANIE] Ozhidanie gotovnosti PostgreSQL...
:wait_postgres
timeout /t 2 /nobreak >nul
docker-compose -f docker-compose.https.yml exec -T postgres pg_isready -U prisma >nul 2>&1
if errorlevel 1 (
    echo [OZHIDANIE] PostgreSQL eshche ne gotov, zhdem...
    goto wait_postgres
)
echo [OK] PostgreSQL gotov k rabote
echo.

REM Shag 6: Sbornka i zapusk proekta
echo [Shag 6] Sbornka i zapusk proekta...
echo [INFO] Konteynery budut obnovleny tolko pri izmenenii koda
echo [INFO] BD i volumes NE budut udaleny
echo.

echo [SBORKA] Sbornka konteynerov (tolko pri neobhodimosti)...
docker-compose -f docker-compose.https.yml build
if errorlevel 1 (
    echo [OSHIBKA] Oshibka pri sbornke!
    pause
    exit /b 1
)

echo [ZAPUSK] Zapusk/obnovlenie vseh servisov...
echo [INFO] Backend avtomaticheski:
echo        - Proverit/sozdast BD (ensure-database.js)
echo        - Primenit vse migracii (prisma migrate deploy)
echo        - Zapustit vse skripty inicializacii (initialize-db.js)
echo        - Zapustit server
echo [INFO] Frontend budet sobran i razmeshchen v nginx
echo [INFO] Nginx budet rabotat na HTTPS (port 8443)
echo [INFO] Sushestvuyushchie konteynery budut perezapushcheny tolko pri neobhodimosti
echo.

docker-compose -f docker-compose.https.yml up -d

if errorlevel 1 (
    echo.
    echo [OSHIBKA] Ne udalos zapustit proekt!
    echo.
    echo Proverte logi:
    echo   docker-compose -f docker-compose.all.yml logs
    echo.
    echo Ili logi konkretnogo servisa:
    echo   docker-compose -f docker-compose.all.yml logs app
    echo   docker-compose -f docker-compose.all.yml logs postgres
    echo.
    pause
    exit /b 1
)

echo.
echo [PROVERKA] Ozhidanie zapuska servisov i inicializacii BD...
echo [INFO] Eto mozhet zanyat 30-60 sekund...
timeout /t 15 /nobreak >nul

echo.
echo [PROVERKA] Status konteynerov:
docker-compose -f docker-compose.https.yml ps

echo.
echo [PROVERKA] Proverka logov backend na oshibki...
docker-compose -f docker-compose.https.yml logs --tail=30 backend | findstr /C:"ERROR" /C:"error" >nul 2>&1
if not errorlevel 1 (
    echo [VNIMANIE] Obnaruzheny oshibki v logah backend!
    echo Posmotrite logi: docker-compose -f docker-compose.https.yml logs backend
) else (
    echo [OK] Kriticheskih oshibok ne obnaruzheno
)
echo.

echo ========================================
echo   Proekt uspeshno zapushchen!
echo ========================================
echo.
echo Dostup k prilozheniyu:
echo   HTTPS: https://localhost:8443
echo   HTTP: http://localhost:8080 (perenapravlyaet na HTTPS)
echo   Backend API: https://localhost:8443/api
echo.
echo Informaciya o BD:
echo   - Baza dannyh: mydb (sohranena, ne udalena)
echo   - Polzovatel: prisma
echo   - Vse migracii primeneny avtomaticheski
echo   - Vse skripty inicializacii vypolneny
echo.
echo [VAZHNO] Konteynery i BD NE byli udaleny, tolko obnovleny pri neobhodimosti
echo.
echo Poleznye komandy:
echo   - Logi vseh servisov: docker-compose -f docker-compose.https.yml logs -f
echo   - Logi backend:       docker-compose -f docker-compose.https.yml logs -f backend
echo   - Logi frontend:       docker-compose -f docker-compose.https.yml logs -f frontend
echo   - Logi nginx:          docker-compose -f docker-compose.https.yml logs -f nginx
echo   - Logi postgres:       docker-compose -f docker-compose.https.yml logs -f postgres
echo   - Ostanovka:           docker-compose -f docker-compose.https.yml stop
echo   - Ostanovka + udalenie: docker-compose -f docker-compose.https.yml down
echo   - Ostanovka + volumes: docker-compose -f docker-compose.https.yml down -v (UDALIT BD!)
echo   - Status:              docker-compose -f docker-compose.https.yml ps
echo   - Perezapusk:          docker-compose -f docker-compose.https.yml restart
echo.
pause
