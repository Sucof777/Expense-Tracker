# --- Build stage (Composer deps) ---
FROM composer:2-alpine AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
COPY . .
RUN composer dump-autoload --optimize

# --- Runtime stage (PHP-FPM + Nginx) ---
FROM richarvey/nginx-php-fpm:php8.2
WORKDIR /var/www/html
COPY --from=vendor /app ./
# Laravel permissions
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache
# Nginx doc root
ENV WEBROOT=/var/www/html/public
# Expose port for Render ($PORT env se mapira interno)
EXPOSE 10000
