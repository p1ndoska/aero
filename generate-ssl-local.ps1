# Скрипт для генерации SSL сертификатов локально (для Docker)

$sslDir = "nginx\ssl"

# Создаем директорию, если её нет
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force | Out-Null
    Write-Host "Создана директория: $sslDir" -ForegroundColor Green
}

# Проверяем, есть ли уже сертификаты
if ((Test-Path "$sslDir\cert.pem") -and (Test-Path "$sslDir\key.pem")) {
    Write-Host "SSL сертификаты уже существуют в $sslDir" -ForegroundColor Yellow
    Write-Host "Для пересоздания удалите файлы cert.pem и key.pem" -ForegroundColor Yellow
    exit 0
}

# Проверяем наличие OpenSSL
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host "OpenSSL не найден!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите OpenSSL одним из способов:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey: choco install openssl" -ForegroundColor Cyan
    Write-Host "2. Или используйте Git Bash / WSL для запуска generate-ssl.sh" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Или сертификаты будут созданы автоматически при первом запуске контейнера" -ForegroundColor Yellow
    exit 1
}

Write-Host "Генерация самоподписанного SSL сертификата с SAN..." -ForegroundColor Cyan
Write-Host "Параметры: C=BY, ST=Minsk, L=Minsk, O=Aero, CN=localhost" -ForegroundColor Gray
Write-Host "SAN: localhost, *.localhost, 127.0.0.1, ::1" -ForegroundColor Gray
Write-Host ""

# Создаем конфиг для SAN
$configFile = "$sslDir\openssl.conf"
$configLines = @(
    "[req]",
    "distinguished_name = req_distinguished_name",
    "req_extensions = v3_req",
    "",
    "[req_distinguished_name]",
    "C = BY",
    "ST = Minsk",
    "L = Minsk",
    "O = Aero",
    "CN = localhost",
    "",
    "[v3_req]",
    "basicConstraints = CA:FALSE",
    "keyUsage = nonRepudiation, digitalSignature, keyEncipherment",
    "subjectAltName = @alt_names",
    "",
    "[alt_names]",
    "DNS.1 = localhost",
    "DNS.2 = *.localhost",
    "IP.1 = 127.0.0.1",
    "IP.2 = ::1"
)
$configLines | Out-File -FilePath $configFile -Encoding ASCII -Force

# Генерируем приватный ключ
Write-Host "[1/3] Генерация приватного ключа..." -ForegroundColor Yellow
openssl genrsa -out "$sslDir\key.pem" 2048
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при генерации ключа" -ForegroundColor Red
    Remove-Item $configFile -Force -ErrorAction SilentlyContinue
    exit 1
}

# Генерируем сертификат с SAN
Write-Host "[2/3] Генерация сертификата с SAN..." -ForegroundColor Yellow
openssl req -new -x509 -key "$sslDir\key.pem" -out "$sslDir\cert.pem" -days 365 -config $configFile -extensions v3_req -subj "/C=BY/ST=Minsk/L=Minsk/O=Aero/CN=localhost"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при генерации сертификата" -ForegroundColor Red
    Remove-Item $configFile -Force -ErrorAction SilentlyContinue
    exit 1
}

# Удаляем временный конфиг
Remove-Item $configFile -Force -ErrorAction SilentlyContinue

# Проверяем сертификат
Write-Host "[3/3] Проверка сертификата..." -ForegroundColor Yellow
$certCheck = openssl x509 -in "$sslDir\cert.pem" -text -noout 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SSL сертификаты успешно созданы в $sslDir" -ForegroundColor Green
    Write-Host "Это самоподписанный сертификат для разработки" -ForegroundColor Yellow
    Write-Host "Для production используйте сертификаты от Let's Encrypt или вашего CA" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "Ошибка при проверке сертификата" -ForegroundColor Red
    exit 1
}
