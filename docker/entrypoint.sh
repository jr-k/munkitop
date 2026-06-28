#!/usr/bin/env sh
set -eu

mkdir -p \
  storage/app \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
  SQLITE_DATABASE="${DB_DATABASE:-database/database.sqlite}"

  mkdir -p "$(dirname "$SQLITE_DATABASE")"

  if [ ! -f "$SQLITE_DATABASE" ]; then
    touch "$SQLITE_DATABASE"
  fi
fi

if [ "${APP_ENV:-production}" != "local" ]; then
  if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be set in production." >&2
    exit 1
  fi

  php artisan config:cache --no-ansi
  php artisan route:cache --no-ansi
  php artisan view:cache --no-ansi
fi

php artisan migrate --force --no-ansi

exec "$@"
