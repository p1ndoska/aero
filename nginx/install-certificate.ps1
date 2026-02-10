# Script to install SSL certificate to trusted root certificates in Windows
# Requires administrator privileges

$ErrorActionPreference = "Stop"

# Check administrator rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Script must be run as administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    exit 1
}

$sslDir = "nginx\ssl"
$certPath = "$sslDir\cert.pem"

if (-not (Test-Path $certPath)) {
    Write-Host "[ERROR] Certificate not found: $certPath" -ForegroundColor Red
    Write-Host "First create certificate: .\nginx\generate-ssl-improved.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Installing SSL certificate to trusted root certificates..." -ForegroundColor Cyan

try {
    # Import certificate to trusted root certificates store
    Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop
    
    Write-Host "[OK] Certificate successfully installed!" -ForegroundColor Green
    Write-Host "Restart browser and open https://localhost:8443" -ForegroundColor Yellow
    Write-Host "The 'Not secure' warning should disappear." -ForegroundColor Yellow
    
} catch {
    Write-Host "[ERROR] Failed to install certificate: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}




