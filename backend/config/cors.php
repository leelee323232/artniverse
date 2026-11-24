<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password',
        'user/*',
        'email/*',
    ],

    'allowed_methods' => ['*'],

    // Exact frontend origins, including scheme and port; no trailing slash.
    // Keep FRONTEND_URL as the fallback for existing deployments.
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS') ?: env('FRONTEND_URL', 'http://localhost:3000')),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
