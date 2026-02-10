# Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Prisma)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client (не требует DATABASE_URL, только схему)
RUN npx prisma generate

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Run migrations, initialize database, and start server
# Используем скрипт для правильной последовательности выполнения
CMD ["sh", "-c", "echo '🚀 Запуск backend...' && node scripts/ensure-database.js && echo ' БД проверена/создана' && npx prisma migrate deploy && echo ' Миграции применены' && node scripts/initialize-db.js && echo ' БД инициализирована' && echo '🚀 Запуск сервера...' && node ./bin/www"]
