<?php

use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ImageUploadController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\AvatarController;
use App\Http\Controllers\Api\V1\RegisterController;
use App\Http\Controllers\Api\V1\RevokeAuthTokenController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', RegisterController::class)
        ->middleware('throttle:5,1')
        ->name('api.v1.auth.register');

    Route::post('/auth/token', AuthTokenController::class)
        ->middleware('throttle:login')
        ->name('api.v1.auth.token');

    Route::get('/health', [HealthController::class, 'show'])
        ->name('api.v1.health');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/images', ImageUploadController::class)
            ->middleware('throttle:10,1')
            ->name('api.v1.images.store');

        Route::get('/me', MeController::class)
            ->name('api.v1.me');

        Route::patch('/me', [ProfileController::class, 'update'])
            ->middleware('throttle:30,1')
            ->name('api.v1.me.update');

        Route::post('/me/avatar', [AvatarController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('api.v1.me.avatar');

        Route::delete('/auth/token', RevokeAuthTokenController::class)
        ->name('api.v1.auth.token.destroy');

        Route::get(
            '/health/authenticated',
            [HealthController::class, 'authenticated']
        )->name('api.v1.health.authenticated');
    });

    require __DIR__.'/product.php';

    // Keep checkout routes inside this group so TapPay endpoints use /api/v1.
    // Deploy this file together with routes/checkout.php.
    require __DIR__.'/checkout.php';
});
