<?php

use App\Http\Controllers\Api\V1\ProductFavoriteController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:60,1'])->controller(ProductFavoriteController::class)
    ->group(function (): void {
        Route::get('/me/favorite-products', 'index');
        Route::get('/product/favorite-statuses', 'statuses');
        Route::get('/product/{product}/favorite', 'show')->whereNumber('product');
        Route::put('/product/{product}/favorite', 'store')->whereNumber('product')->middleware('throttle:30,1');
        Route::delete('/product/{product}/favorite', 'destroy')->whereNumber('product')->middleware('throttle:30,1');
    });
