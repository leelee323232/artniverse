<?php

use App\Http\Controllers\Api\V1\CreatorApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::get('/creator-applications/options', [CreatorApplicationController::class, 'options'])->middleware('throttle:60,1');
    Route::get('/creator-applications/me', [CreatorApplicationController::class, 'latest'])->middleware('throttle:60,1');
    Route::post('/creator-applications', [CreatorApplicationController::class, 'store'])->middleware('throttle:5,1');
    Route::prefix('admin/creator-applications')->middleware('throttle:60,1')->group(function (): void {
        Route::get('/', [CreatorApplicationController::class, 'index']);
        Route::get('/{application}', [CreatorApplicationController::class, 'show'])->whereNumber('application');
        Route::patch('/{application}', [CreatorApplicationController::class, 'review'])->whereNumber('application')->middleware('throttle:20,1');
        Route::get('/{application}/documents/{side}', [CreatorApplicationController::class, 'document'])->whereNumber('application')->whereIn('side', ['front', 'back']);
    });
});
