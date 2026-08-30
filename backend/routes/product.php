<?php
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('product')
    ->controller(ProductController::class)
    ->group(function (): void {
        Route::get('/', 'index')->name('product.index');

        Route::get('/{product}', 'show')
            ->whereNumber('product')
            ->name('product.show');
    });