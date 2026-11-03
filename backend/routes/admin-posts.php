<?php

use App\Http\Controllers\Api\V1\AdminPostController;
use App\Http\Controllers\Api\V1\PostController;
use Illuminate\Support\Facades\Route;

Route::get('/posts', [PostController::class, 'index'])->middleware('throttle:60,1');

Route::prefix('admin/posts')->middleware(['auth:sanctum', 'throttle:60,1'])
    ->controller(AdminPostController::class)->group(function (): void {
        Route::get('/', 'index');
        Route::post('/images', 'upload')->middleware('throttle:10,1');
        Route::post('/', 'store')->middleware('throttle:20,1');
        Route::get('/{post}', 'show')->whereNumber('post');
        Route::delete('/{post}', 'destroy')->whereNumber('post')->middleware('throttle:20,1');
    });
