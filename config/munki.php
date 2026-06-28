<?php

return [
    'repo_path' => env('MUNKI_REPO_PATH', storage_path('app/munki_repo')),
    'default_catalog' => env('MUNKI_DEFAULT_CATALOG', 'production'),
    'base_manifest' => env('MUNKI_BASE_MANIFEST', 'base'),
    'admin_email' => env('ADMIN_EMAIL', 'admin@example.com'),
    'admin_password' => env('ADMIN_PASSWORD', 'password'),
];
