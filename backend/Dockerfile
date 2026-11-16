FROM dunglas/frankenphp:1-php8.5-alpine
RUN install-php-extensions pdo_pgsql intl zip \
    && apk add --no-cache postgresql16-client \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
COPY . .
RUN touch .env \
    && composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data /app /data /config
ARG GIT_SHA=local
ENV APP_COMMIT=$GIT_SHA
USER www-data
EXPOSE 8000
# FrankenPHP atiende varias peticiones a la vez. Escucha en el mismo puerto 8000 que antes.
CMD ["sh", "-c", "php artisan migrate --force && exec frankenphp php-server --listen 0.0.0.0:8000 --root /app/public"]
