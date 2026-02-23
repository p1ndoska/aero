# ЭТАП 1: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Игнорируем конфликты React 19
RUN npm ci --legacy-peer-deps
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
