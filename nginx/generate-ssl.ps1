# PowerShell script to generate self-signed SSL certificate for development
# For production, use certificates from Let's Encrypt or your CA

# Create ssl directory if it doesn't exist
if (-not (Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl"
}

# Check if OpenSSL is available
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host "OpenSSL not found. Please install OpenSSL or use WSL/Git Bash to run generate-ssl.sh" -ForegroundColor Red
    Write-Host "You can install OpenSSL via:"
    Write-Host "  - Chocolatey: choco install openssl"
    Write-Host "  - Or use Git Bash / WSL to run generate-ssl.sh"
    exit 1
}

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
    -keyout ssl/key.pem `
    -out ssl/cert.pem `
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

Write-Host "SSL certificates generated in nginx/ssl/" -ForegroundColor Green
Write-Host "For production, replace these with real certificates from Let's Encrypt" -ForegroundColor Yellow

