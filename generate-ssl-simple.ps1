$sslDir = "nginx\ssl"
if (-not (Test-Path $sslDir)) { New-Item -ItemType Directory -Path $sslDir -Force | Out-Null }

Remove-Item "$sslDir\cert.pem", "$sslDir\key.pem", "$sslDir\openssl.conf" -Force -ErrorAction SilentlyContinue

$configFile = "$sslDir\openssl.conf"
$lines = @(
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
$lines | Out-File -FilePath $configFile -Encoding ASCII -Force

openssl genrsa -out "$sslDir\key.pem" 2048
openssl req -new -x509 -key "$sslDir\key.pem" -out "$sslDir\cert.pem" -days 365 -config $configFile -extensions v3_req -subj "/C=BY/ST=Minsk/L=Minsk/O=Aero/CN=localhost"
Remove-Item $configFile -Force

if (Test-Path "$sslDir\cert.pem") {
    Write-Host "SSL сертификаты успешно созданы!" -ForegroundColor Green
} else {
    Write-Host "Ошибка при создании сертификатов" -ForegroundColor Red
    exit 1
}

