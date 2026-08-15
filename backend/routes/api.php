<?php

use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MeController;
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
        Route::get('/me', MeController::class)
            ->name('api.v1.me');

        Route::delete('/auth/token', RevokeAuthTokenController::class)
        ->name('api.v1.auth.token.destroy');

        Route::get(
            '/health/authenticated',
            [HealthController::class, 'authenticated']
        )->name('api.v1.health.authenticated');
    });
});