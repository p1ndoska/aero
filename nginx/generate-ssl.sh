#!/bin/bash
# Script to generate self-signed SSL certificate for development
# For production, use certificates from Let's Encrypt or your CA

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Check if certificates already exist
if [ -f ssl/cert.pem ] && [ -f ssl/key.pem ]; then
    echo "SSL certificates already exist in nginx/ssl/"
    echo "Delete cert.pem and key.pem to regenerate"
    exit 0
fi

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=BY/ST=Minsk/L=Minsk/O=Aero/CN=localhost"

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "✅ SSL certificates generated in nginx/ssl/"
echo "⚠️  This is a self-signed certificate for development only"
echo "   For production, use certificates from Let's Encrypt or your CA"

