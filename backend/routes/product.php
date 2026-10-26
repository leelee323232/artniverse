<?php
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CartController;
use Illuminate\Support\Facades\Route;

Route::prefix('product')
    ->controller(ProductController::class)
    ->group(function (): void {
        Route::get('/', 'index')->name('product.index');

        Route::get('/{product}', 'show')
            ->whereNumber('product')
            ->name('product.show');
    });

Route::middleware(['auth:sanctum', 'throttle:60,1'])
    ->prefix('cart')
    ->controller(CartController::class)
    ->group(function (): void {
        Route::get('/', 'index')->name('cart.index');
        Route::post('/', 'store')->name('cart.store');
        Route::patch('/{item}', 'update')->name('cart.update');
        Route::delete('/{item}', 'destroy')->name('cart.destroy');
    });
