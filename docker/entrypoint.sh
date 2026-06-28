#!/usr/bin/env sh
set -eu

mkdir -p \
  storage/app \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ ! -f database/database.sqlite ] && [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
  touch database/database.sqlite
fi

if [ "${APP_ENV:-production}" != "local" ]; then
  if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be set in production." >&2
    exit 1
  fi

  php artisan config:cache --no-ansi
  php artisan migrate --force --no-ansi
  php artisan route:cache --no-ansi
  php artisan view:cache --no-ansi
fi

exec "$@"
