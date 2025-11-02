# ===== Composer (PHP deps) =====
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress
COPY . .
RUN composer dump-autoload --optimize

# ===== Vite (assets) – ako NEMAŠ front assets u Laravelu, možeš preskočiti cijeli ovaj stage =====
FROM node:20-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else npm i; fi
COPY --from=vendor /app ./
RUN npm run build || true

# ===== Runtime (Alpine + nginx + php-fpm) =====
FROM alpine:3.20
# sigurnosni update + paketi
RUN apk update && apk upgrade --no-cache && apk add --no-cache \
      php82 php82-fpm php82-opcache php82-pdo php82-pdo_mysql php82-mbstring php82-xml php82-curl php82-zip php82-fileinfo php82-tokenizer php82-dom php82-session \
      nginx tzdata ca-certificates curl

# korisnik i priprema
RUN addgroup -S app && adduser -S app -G app && mkdir -p /run/nginx
WORKDIR /var/www/html

# app + build assets
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build

# nginx/php-fpm config
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# permisije
RUN chown -R app:app storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

ENV APP_ENV=production
EXPOSE 10000
USER app

CMD php-fpm82 -D && nginx -g 'daemon off;'
