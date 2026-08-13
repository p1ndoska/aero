# Generate self-signed SSL certificates for localhost with SAN extensions

$ErrorActionPreference = "Stop"

function Find-OpenSsl {
    $cmd = Get-Command openssl -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $gitPaths = @(
        "$env:ProgramFiles\Git\usr\bin\openssl.exe",
        "${env:ProgramFiles(x86)}\Git\usr\bin\openssl.exe"
    )
    foreach ($path in $gitPaths) {
        if (Test-Path $path) { return $path }
    }

    return $null
}

function New-SslWithOpenSsl {
    param(
        [string]$OpenSslPath,
        [string]$SslDir
    )

    $opensslConfig = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req
x509_extensions = v3_ca

[dn]
C=BY
ST=Minsk
L=Minsk
O=BelAeronavigatsia
CN=localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment, keyAgreement
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
authorityKeyIdentifier = keyid,issuer

[v3_ca]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment, keyAgreement
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
authorityKeyIdentifier = keyid,issuer

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = 0.0.0.0
"@

    $configFile = Join-Path $SslDir "openssl.conf"
    $opensslConfig | Out-File -FilePath $configFile -Encoding ASCII

    try {
        Write-Host "[1/3] Generating private key..." -ForegroundColor Yellow
        & $OpenSslPath genrsa -out (Join-Path $SslDir "key.pem") 2048
        if ($LASTEXITCODE -ne 0) { throw "Failed to generate private key" }

        Write-Host "[2/3] Generating certificate with SAN..." -ForegroundColor Yellow
        & $OpenSslPath req -new -x509 -key (Join-Path $SslDir "key.pem") -out (Join-Path $SslDir "cert.pem") -days 365 -config $configFile -extensions v3_req
        if ($LASTEXITCODE -ne 0) { throw "Failed to generate certificate" }

        Write-Host "[3/3] Verifying certificate..." -ForegroundColor Yellow
        & $OpenSslPath x509 -in (Join-Path $SslDir "cert.pem") -text -noout | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Failed to verify certificate" }
    } finally {
        if (Test-Path $configFile) {
            Remove-Item $configFile -Force
        }
    }
}

function New-SslWithDocker {
    param([string]$SslDir)

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "Docker is not available"
    }

    $absSslDir = (Resolve-Path $SslDir).Path
    Write-Host "[INFO] Using Docker OpenSSL to generate certificates..." -ForegroundColor Cyan

    docker run --rm -v "${absSslDir}:/ssl" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout /ssl/key.pem -out /ssl/cert.pem `
        -subj "/C=BY/ST=Minsk/L=Minsk/O=BelAeronavigatsia/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

    if ($LASTEXITCODE -ne 0) { throw "Docker OpenSSL failed to generate certificates" }
}

function New-SslWithPowerShell {
    param([string]$SslDir)

    Write-Host "[INFO] OpenSSL not found, using built-in Windows certificate generator..." -ForegroundColor Cyan

    $cert = New-SelfSignedCertificate `
        -Subject "CN=localhost" `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") `
        -DnsName @("localhost", "*.localhost", "127.0.0.1") `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -NotAfter (Get-Date).AddDays(365) `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -KeyExportPolicy Exportable `
        -FriendlyName "Aero Local Dev"

    try {
        Write-Host "[1/2] Exporting certificate..." -ForegroundColor Yellow
        $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
        $certBase64 = [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        @(
            "-----BEGIN CERTIFICATE-----"
            $certBase64
            "-----END CERTIFICATE-----"
        ) | Set-Content -Path (Join-Path $SslDir "cert.pem") -Encoding Ascii

        Write-Host "[2/2] Exporting private key..." -ForegroundColor Yellow
        $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
        if (-not $rsa) { throw "Failed to access certificate private key" }

        $exportMethod = $rsa.GetType().GetMethod("ExportPkcs8PrivateKey")
        if (-not $exportMethod) { throw "Private key export is not supported on this PowerShell/.NET version" }

        $keyBytes = $rsa.ExportPkcs8PrivateKey()
        $keyBase64 = [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        @(
            "-----BEGIN PRIVATE KEY-----"
            $keyBase64
            "-----END PRIVATE KEY-----"
        ) | Set-Content -Path (Join-Path $SslDir "key.pem") -Encoding Ascii
    } finally {
        Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force -ErrorAction SilentlyContinue
    }
}

$sslDir = "nginx\ssl"
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force | Out-Null
}

Write-Host "[INFO] Generating SSL certificate with SAN..." -ForegroundColor Cyan

try {
    $opensslPath = Find-OpenSsl
    if ($opensslPath) {
        Write-Host "[INFO] Using OpenSSL: $opensslPath" -ForegroundColor Gray
        New-SslWithOpenSsl -OpenSslPath $opensslPath -SslDir $sslDir
    } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
        New-SslWithDocker -SslDir $sslDir
    } else {
        New-SslWithPowerShell -SslDir $sslDir
    }

    Write-Host "[OK] SSL certificates created successfully!" -ForegroundColor Green
    Write-Host "  - Key: $sslDir\key.pem" -ForegroundColor Gray
    Write-Host "  - Cert: $sslDir\cert.pem" -ForegroundColor Gray
    Write-Host "  - Valid for: 365 days" -ForegroundColor Gray
    Write-Host "  - SAN: localhost, *.localhost, 127.0.0.1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[INFO] To avoid browser 'Not secure' warnings, import cert.pem into Trusted Root CAs." -ForegroundColor Cyan
    Write-Host "  PowerShell (run as Administrator):" -ForegroundColor Yellow
    Write-Host "  Import-Certificate -FilePath '$sslDir\cert.pem' -CertStoreLocation Cert:\LocalMachine\Root" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Install OpenSSL: choco install openssl" -ForegroundColor Yellow
    Write-Host "Or install Git for Windows (includes OpenSSL in Git\\usr\\bin)" -ForegroundColor Yellow
    exit 1
}
