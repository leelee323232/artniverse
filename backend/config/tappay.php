<?php

return [
    'enabled' => env('TAPPAY_ENABLED', false),
    // Deliberately sandbox-only until the production rollout is separately approved.
    'environment' => env('TAPPAY_ENV', 'sandbox'),
    'app_id' => env('TAPPAY_APP_ID'),
    'app_key' => env('TAPPAY_APP_KEY'),
    'partner_key' => env('TAPPAY_PARTNER_KEY'),
    'merchant_id' => env('TAPPAY_MERCHANT_ID'),
    'three_domain_secure' => env('TAPPAY_3D_SECURE', true),
    'return_url' => env('TAPPAY_RETURN_URL'),
    'notify_url' => env('TAPPAY_NOTIFY_URL'),
    // Pricing policy, not a logistics integration. Must be agreed before enabling checkout.
    'shipping_fee' => env('CHECKOUT_SHIPPING_FEE'),
    'free_shipping_threshold' => env('CHECKOUT_FREE_SHIPPING_THRESHOLD'),
];
