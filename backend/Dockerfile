# ===== 1) Composer (PHP deps) =====
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts
COPY . .
RUN composer dump-autoload --optimize --no-scripts

# ===== 2) (Opciono) Vite assets =====
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

# OS update + PHP/NGINX paketi
RUN apk update && apk upgrade --no-cache && apk add --no-cache \
      php82 php82-fpm php82-opcache php82-pdo php82-pdo_mysql php82-mbstring php82-xml \
      php82-curl php82-zip php82-fileinfo php82-tokenizer php82-dom php82-session \
      nginx tzdata ca-certificates curl

# Non-root korisnik
RUN addgroup -S app && adduser -S app -G app

# php-fpm global: logovi na STDERR i bez daemonize
RUN sed -i 's|^;*error_log = .*|error_log = /proc/self/fd/2|' /etc/php82/php-fpm.conf \
 && sed -i 's|^;*daemonize = .*|daemonize = no|' /etc/php82/php-fpm.conf

# Nginx runtime priprema: /tmp za sve temp/log
RUN mkdir -p /run/nginx \
    /tmp/nginx/client_body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi \
 && chown -R app:app /run/nginx /tmp/nginx

WORKDIR /var/www/html

# App + assets
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build

# Konfiguracije
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Dozvole za Laravel
RUN chown -R app:app storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

ENV APP_ENV=production
EXPOSE 10000

USER app

# php-fpm u foregroundu + nginx u foregroundu
CMD php-fpm82 & nginx -g 'daemon off;'
