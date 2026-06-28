#!/usr/bin/env sh
set -eu

run_as_app_user() {
  if [ "$(id -u)" = "0" ]; then
    su-exec www-data "$@"
  else
    "$@"
  fi
}

mkdir -p \
  storage/app \
  storage/app/munki_repo \
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

if [ "$(id -u)" = "0" ]; then
  chown -R www-data:www-data storage bootstrap/cache

  if [ -d node_modules ]; then
    mkdir -p node_modules/.cache
    chown -R www-data:www-data node_modules/.cache
  fi

  if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    chown -R www-data:www-data "$(dirname "$SQLITE_DATABASE")"
  fi
fi

if [ "${APP_ENV:-production}" != "local" ]; then
  if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be set in production." >&2
    exit 1
  fi

  run_as_app_user php artisan config:cache --no-ansi
  run_as_app_user php artisan route:cache --no-ansi
  run_as_app_user php artisan view:cache --no-ansi
fi

run_as_app_user php artisan migrate --force --no-ansi

if [ "$(id -u)" = "0" ]; then
  exec su-exec www-data "$@"
fi

exec "$@"
