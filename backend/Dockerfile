# ===== 1) Composer (PHP deps) =====
FROM composer:2 AS vendor
WORKDIR /app

# Samo composer fajlovi radi keširanja
COPY composer.json composer.lock ./
# Spriječi artisan skripte u build fazi
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts

# Sada cijeli kod
COPY . .
RUN composer dump-autoload --optimize --no-scripts


# ===== 2) (Opciono) Vite assets =====
# Ako nemaš Vite u Laravelu, ostavi stage, build će preskočiti zbog "|| true"
FROM node:20-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else npm i; fi
COPY --from=vendor /app ./
RUN npm run build || true


# ===== 3) Runtime (Alpine + nginx + php-fpm) =====
FROM alpine:3.20

# OS update + PHP/NGINX paketi (dodaj još ekstenzija po potrebi)
RUN apk update && apk upgrade --no-cache && apk add --no-cache \
      php82 php82-fpm php82-opcache php82-pdo php82-pdo_mysql php82-mbstring php82-xml \
      php82-curl php82-zip php82-fileinfo php82-tokenizer php82-dom php82-session \
      nginx tzdata ca-certificates curl

# Non-root korisnik i priprema
RUN addgroup -S app && adduser -S app -G app && mkdir -p /run/nginx

# Preusmjeri globalni php-fpm error log na STDERR (fix za Permission denied)
RUN sed -i 's|^;*error_log = .*|error_log = /proc/self/fd/2|' /etc/php82/php-fpm.conf

WORKDIR /var/www/html

# Kopiraj app + build assets
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build

# Konfiguracije
COPY deploy/nginx.conf /etc/nginx/nginx.conf
# POOL config (www)
COPY deploy/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Dozvole za Laravel
RUN chown -R app:app storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

ENV APP_ENV=production
EXPOSE 10000

USER app

# Pokreni php-fpm u pozadini, nginx u foregroundu
CMD php-fpm82 -D && nginx -g 'daemon off;'
