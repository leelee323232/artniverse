<?php

use App\Http\Controllers\Api\V1\CreatorProductController;
use Illuminate\Support\Facades\Route;

Route::get('/me/products', [CreatorProductController::class, 'index'])
    ->middleware(['auth:sanctum', 'throttle:60,1'])
    ->name('api.v1.me.products');
