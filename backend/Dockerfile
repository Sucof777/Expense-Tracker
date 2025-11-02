# ===== Composer (PHP deps) =====
FROM --platform=linux/amd64 composer:2-alpine AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress
COPY . .
RUN composer dump-autoload --optimize

# ===== Vite (assets) – opcionalno; ako nemaš Vite, možeš preskočiti ovu fazu =====
FROM node:20-slim AS assets
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else npm i; fi
COPY --from=vendor /app ./
# Ako nemaš Vite build, ovu liniju zamijeni sa: RUN echo "skip vite"
RUN npm run build || true

# ===== Runtime (Alpine + nginx + php-fpm) =====
FROM alpine:3.20
RUN apk add --no-cache \
      php82 php82-fpm php82-opcache php82-pdo php82-pdo_mysql php82-mbstring php82-xml php82-curl php82-zip php82-fileinfo php82-tokenizer php82-dom php82-session \
      nginx tzdata ca-certificates curl \
  && addgroup -S app && adduser -S app -G app && mkdir -p /run/nginx

WORKDIR /var/www/html

# App + build assets
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build

# Konfiguracije
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Dozvole
RUN chown -R app:app storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

ENV APP_ENV=production
EXPOSE 10000
USER app

CMD php-fpm82 -D && nginx -g 'daemon off;'
