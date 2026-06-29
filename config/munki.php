<?php

return [
    'repo_path' => env('MUNKI_REPO_PATH', storage_path('app/munki_repo')),
    'default_catalog' => env('MUNKI_DEFAULT_CATALOG', 'production'),
    'base_manifest' => env('MUNKI_BASE_MANIFEST', 'base'),
    'package_x_accel' => env('MUNKI_PACKAGE_X_ACCEL', false),
];
