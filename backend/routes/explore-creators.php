<?php

use App\Http\Controllers\Api\V1\ExploreCreatorController;
use Illuminate\Support\Facades\Route;

Route::prefix('creators')->middleware('throttle:60,1')->controller(ExploreCreatorController::class)->group(function (): void {
    Route::get('/', 'index');
    Route::get('/tags', 'tags');
    Route::get('/{creator}', 'show')->whereNumber('creator');
});
