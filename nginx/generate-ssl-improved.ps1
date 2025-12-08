# Улучшенная генерация SSL сертификатов для localhost
# Создает сертификат с правильными SAN (Subject Alternative Names)

$ErrorActionPreference = "Stop"

# Проверка наличия OpenSSL
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Host "[ОШИБКА] OpenSSL не найден!" -ForegroundColor Red
    Write-Host "Установите OpenSSL:" -ForegroundColor Yellow
    Write-Host "  choco install openssl" -ForegroundColor Yellow
    Write-Host "  или скачайте с https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    exit 1
}

# Создание директории если не существует
$sslDir = "nginx\ssl"
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force | Out-Null
}

Write-Host "[INFO] Генерация улучшенного SSL сертификата..." -ForegroundColor Cyan

# Создание конфигурации для OpenSSL
$opensslConfig = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=BY
ST=Minsk
L=Minsk
O=BelAeronavigatsia
CN=localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
"@

# Сохранение конфигурации во временный файл
$configFile = "$sslDir\openssl.conf"
$opensslConfig | Out-File -FilePath $configFile -Encoding ASCII

try {
    # Генерация приватного ключа
    Write-Host "[1/3] Генерация приватного ключа..." -ForegroundColor Yellow
    & openssl genrsa -out "$sslDir\key.pem" 2048
    if ($LASTEXITCODE -ne 0) { throw "Ошибка генерации ключа" }

    # Генерация сертификата с SAN
    Write-Host "[2/3] Генерация сертификата с SAN..." -ForegroundColor Yellow
    & openssl req -new -x509 -key "$sslDir\key.pem" -out "$sslDir\cert.pem" -days 365 -config $configFile -extensions v3_req
    if ($LASTEXITCODE -ne 0) { throw "Ошибка генерации сертификата" }

    # Проверка сертификата
    Write-Host "[3/3] Проверка сертификата..." -ForegroundColor Yellow
    & openssl x509 -in "$sslDir\cert.pem" -text -noout | Select-String -Pattern "Subject Alternative Name" | Out-Null
    
    Write-Host "[OK] SSL сертификаты успешно созданы!" -ForegroundColor Green
    Write-Host "  - Ключ: $sslDir\key.pem" -ForegroundColor Gray
    Write-Host "  - Сертификат: $sslDir\cert.pem" -ForegroundColor Gray
    Write-Host "  - Действителен: 365 дней" -ForegroundColor Gray
    Write-Host "  - SAN: localhost, *.localhost, 127.0.0.1, ::1" -ForegroundColor Gray
    
} catch {
    Write-Host "[ОШИБКА] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Удаление временного файла конфигурации
    if (Test-Path $configFile) {
        Remove-Item $configFile -Force
    }
}

