# ЭТАП 1: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
# Корневые сертификаты корпоративной сети: положите *.crt / *.cer / *.pem (Base-64) в certs/
COPY certs/ /tmp/corp-certs/
RUN find /tmp/corp-certs -type f \( -name '*.crt' -o -name '*.cer' -o -name '*.pem' \) \
      -exec sh -c 'sed "s/\r$//" "$1"; echo' _ {} \; >> /etc/ssl/certs/ca-certificates.crt && \
    rm -rf /tmp/corp-certs
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
COPY package*.json ./
# Игнорируем конфликты React 19
ARG NPM_STRICT_SSL=true
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then \
      export NODE_TLS_REJECT_UNAUTHORIZED=0; \
      npm config set strict-ssl false; \
    fi && \
    npm ci --legacy-peer-deps
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ЭТАП 2: Раздача (Nginx)
FROM nginx:stable-alpine

# Копируем собранный фронтенд
COPY --from=builder /app/dist /usr/share/nginx/html

# ВАЖНО: Удаляем дефолтный конфиг и кладем свой в conf.d
# Мы НЕ заменяем основной /etc/nginx/nginx.conf, чтобы не ломать $PATH
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем папку SSL
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

# Запуск
CMD ["nginx", "-g", "daemon off;"]
