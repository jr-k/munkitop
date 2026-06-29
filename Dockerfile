# syntax=docker/dockerfile:1.7

FROM composer:2 AS composer_bin

FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js tsconfig.json ./
RUN npm run build

FROM php:8.4-fpm-alpine AS php_base
WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libzip-dev \
    nginx \
    nodejs \
    npm \
    oniguruma-dev \
    supervisor \
    su-exec \
    sqlite-libs \
    zip \
  && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    sqlite-dev \
  && docker-php-ext-install \
    bcmath \
    intl \
    opcache \
    pcntl \
    pdo_mysql \
    pdo_sqlite \
    zip \
  && apk del .build-deps

COPY --from=composer_bin /usr/bin/composer /usr/bin/composer
COPY docker/php.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache-prod.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-munkitop.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint"]

FROM php_base AS composer_deps
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM php_base AS development
ENV APP_ENV=local
COPY composer.json composer.lock package.json package-lock.json ./
RUN (composer install --no-interaction --prefer-dist --no-scripts \
  || composer install --no-interaction --prefer-source --no-scripts) \
  && npm ci
COPY . .
RUN composer dump-autoload
CMD ["sh", "-lc", "npx concurrently -c \"#93c5fd,#c4b5fd\" \"php artisan serve --host=0.0.0.0 --port=8000\" \"npm run dev -- --host 0.0.0.0\" --names=server,vite --kill-others"]

FROM php_base AS production
ENV APP_ENV=production \
    APP_DEBUG=false

COPY --from=composer_deps /var/www/html/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p storage/app/munki_repo \
  && composer dump-autoload --optimize --no-dev \
  && chown -R www-data:www-data storage bootstrap/cache database

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
