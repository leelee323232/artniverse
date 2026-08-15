<?php

return [
    'user' => [
        'enabled' => (bool) env('TEST_USER_ENABLED', false),
        'name' => env('TEST_USER_NAME', 'Swagger Test User'),
        'email' => env('TEST_USER_EMAIL', 'swagger@example.com'),
        'password' => env('TEST_USER_PASSWORD'),
    ],
];
