<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->uuid('idempotency_key');
            $table->string('request_hash', 64);
            $table->string('environment', 16);
            $table->string('currency', 3)->default('TWD');
            $table->json('items');
            $table->text('contact'); // encrypted:array, using APP_KEY
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('shipping');
            $table->unsignedInteger('total');
            $table->string('payment_status', 32)->default('pending');
            $table->timestamp('expires_at');
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key']);
        });
        Schema::create('tappay_payment_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('checkout_order_id')->constrained('checkout_orders')->restrictOnDelete();
            $table->unsignedInteger('attempt_number');
            $table->string('environment', 16);
            $table->string('merchant_id', 64);
            $table->string('bank_transaction_id', 18)->unique();
            $table->string('rec_trade_id', 64)->nullable()->unique();
            $table->string('notify_token_hash', 64);
            $table->string('status', 32)->default('processing');
            $table->integer('gateway_status')->nullable();
            $table->integer('record_status')->nullable();
            $table->text('payment_url')->nullable();
            $table->timestamps();
            $table->index(['checkout_order_id', 'created_at']);
            $table->unique(['checkout_order_id', 'attempt_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tappay_payment_attempts');
        Schema::dropIfExists('checkout_orders');
    }
};
