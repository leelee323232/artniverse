<?php

use App\Http\Controllers\Api\V1\CheckoutController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

// Provider callback: no browser login/CSRF, authenticated by a per-attempt secret,
// and independently reconciled against TapPay. All customer routes below require login.
Route::post('payments/tappay/notify', [CheckoutController::class, 'notify'])
    ->withoutMiddleware([EnsureFrontendRequestsAreStateful::class])
    ->middleware('throttle:60,1')->name('payments.tappay.notify');

Route::middleware(['auth:sanctum', 'throttle:30,1'])->group(function (): void {
    Route::get('payments/tappay/config', [CheckoutController::class, 'configuration']);
    Route::post('checkout/orders', [CheckoutController::class, 'store'])->middleware('throttle:10,1');
    Route::get('checkout/orders/{order}', [CheckoutController::class, 'show'])->whereUuid('order');
    Route::post('checkout/orders/{order}/pay', [CheckoutController::class, 'pay'])->whereUuid('order')->middleware('throttle:5,1');
    Route::post('checkout/orders/{order}/refresh', [CheckoutController::class, 'refresh'])->whereUuid('order');
});
