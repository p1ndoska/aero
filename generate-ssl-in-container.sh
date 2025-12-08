#!/bin/sh
# Скрипт для генерации SSL сертификатов в контейнере

if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    echo "Генерация самоподписанного SSL сертификата..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=BY/ST=Minsk/L=Minsk/O=Aero/CN=localhost" \
        2>/dev/null
    
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    echo "SSL сертификаты созданы в /etc/nginx/ssl/"
else
    echo "SSL сертификаты уже существуют"
fi

