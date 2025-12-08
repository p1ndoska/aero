# Multi-stage build для всего проекта в одном контейнере

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Build backend (Prisma)
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/prisma ./prisma
RUN npx prisma generate

# Stage 3: Final container with everything
FROM node:18-alpine

# Install supervisor and nginx
RUN apk add --no-cache supervisor nginx

# Create directories
RUN mkdir -p /app/backend /app/frontend/dist /var/log/supervisor /etc/nginx/ssl /var/log/nginx

# Copy backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
# Копируем Prisma Client из builder
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY backend/ ./
RUN mkdir -p uploads

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Install serve для frontend (HTTP сервер для SPA)
RUN npm install -g serve

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports (HTTP 80, HTTPS 443, backend 3000)
EXPOSE 80 443 3000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

