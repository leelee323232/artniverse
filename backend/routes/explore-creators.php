<?php

use App\Http\Controllers\Api\V1\ExploreCreatorController;
use App\Http\Controllers\Api\V1\CreatorFollowController;
use Illuminate\Support\Facades\Route;

Route::prefix('creators')->middleware('throttle:60,1')->controller(ExploreCreatorController::class)->group(function (): void {
    Route::get('/', 'index');
    Route::get('/tags', 'tags');
    Route::get('/{creator}/products', 'products')->whereNumber('creator');
    Route::get('/{creator}', 'show')->whereNumber('creator');
});

Route::prefix('creators')->middleware(['auth:sanctum', 'throttle:60,1'])->group(function (): void {
    Route::get('/{creator}/follow', [CreatorFollowController::class, 'show'])->whereNumber('creator');
    Route::put('/{creator}/follow', [CreatorFollowController::class, 'store'])->whereNumber('creator')->middleware('throttle:30,1');
    Route::delete('/{creator}/follow', [CreatorFollowController::class, 'destroy'])->whereNumber('creator')->middleware('throttle:30,1');
});
