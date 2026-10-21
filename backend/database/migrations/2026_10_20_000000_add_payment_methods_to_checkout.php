<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkout_orders', function (Blueprint $table) {
            $table->string('payment_method', 16)->default('card');
        });
        Schema::table('tappay_payment_attempts', function (Blueprint $table) {
            $table->string('payment_method', 16)->default('card');
            $table->text('payee_info')->nullable(); // encrypted:array
            $table->timestamp('payment_expires_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tappay_payment_attempts', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payee_info', 'payment_expires_at']);
        });
        Schema::table('checkout_orders', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }
};
