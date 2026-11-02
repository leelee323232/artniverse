<?php

use App\Http\Controllers\Api\V1\AdminProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/products')->middleware(['auth:sanctum', 'throttle:60,1'])->controller(AdminProductController::class)->group(function (): void {
    Route::get('/options', 'options');
    Route::get('/', 'index');
    Route::post('/', 'store')->middleware('throttle:20,1');
    Route::get('/{product}', 'show')->whereNumber('product');
    Route::patch('/{product}', 'update')->whereNumber('product');
    Route::delete('/{product}', 'destroy')->whereNumber('product');
});
