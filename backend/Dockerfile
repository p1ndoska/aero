# Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Corporate SSL-inspecting proxies often require legacy TLS renegotiation.
# Node.js ignores OPENSSL_CONF, but Alpine wget uses system OpenSSL and respects it.
COPY docker/openssl-legacy.cnf /etc/ssl/openssl-legacy.cnf
ENV OPENSSL_CONF=/etc/ssl/openssl-legacy.cnf

# Copy package files
COPY package*.json ./

# Skip @prisma/engines postinstall (downloads binaries via Node HTTPS, fails behind corporate proxy)
ARG NPM_STRICT_SSL=true
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then \
      export NODE_TLS_REJECT_UNAUTHORIZED=0; \
      npm config set strict-ssl false; \
    fi && \
    npm ci --ignore-scripts

# Download Prisma engine binaries with wget (uses system OpenSSL + legacy renegotiation config)
COPY docker/download-prisma-engines.sh /tmp/download-prisma-engines.sh
ARG NPM_STRICT_SSL=true
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then export WGET_INSECURE=1; fi && \
    sed -i 's/\r$//' /tmp/download-prisma-engines.sh && sh /tmp/download-prisma-engines.sh

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client using pre-downloaded engines
ARG NPM_STRICT_SSL=true
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/@prisma/engines/schema-engine-linux-musl-openssl-3.0.x
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then export NODE_TLS_REJECT_UNAUTHORIZED=0; fi && \
    npx prisma generate

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Run migrations, initialize database, and start server
CMD ["sh", "-c", "echo '🚀 Запуск backend...' && node scripts/ensure-database.js && echo ' БД проверена/создана' && npx prisma migrate deploy && echo ' Миграции применены' && node scripts/initialize-db.js && echo ' БД инициализирована' && echo '🚀 Запуск сервера...' && node ./bin/www"]
