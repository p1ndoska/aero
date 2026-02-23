#!/bin/sh
# Скрипт для обработки nginx.conf.template с переменными окружения

set -e

# Обрабатываем шаблон nginx.conf с помощью envsubst
envsubst '${NGINX_ERROR_LOG} ${NGINX_PID_FILE} ${NGINX_MIME_TYPES} ${NGINX_SSL_CERT} ${NGINX_SSL_KEY} ${NGINX_ROOT} ${UPLOADS_URL_PREFIX} ${UPLOADS_DIR}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Запускаем nginx
exec nginx -g "daemon off;"

