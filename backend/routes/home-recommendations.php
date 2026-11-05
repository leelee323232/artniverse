<?php

use App\Http\Controllers\Api\V1\HomeRecommendationController;
use Illuminate\Support\Facades\Route;

Route::get('/home/recommendations', [HomeRecommendationController::class, 'index'])
    ->middleware('throttle:60,1')
    ->name('api.v1.home.recommendations');
