# Скрипт для проверки SSL сертификата
$certFile = "nginx\ssl\cert.pem"

if (-not (Test-Path $certFile)) {
    exit 1
}

try {
    $cert = openssl x509 -in $certFile -noout -subject 2>$null
    if ($cert -match 'CN=localhost' -and $cert -match 'O=Aero') {
        exit 0
    } else {
        exit 1
    }
} catch {
    exit 1
}

