<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->comment('聯絡電話');
            $table->date('birthday')->nullable()->comment('生日');
            $table->string('address')->nullable()->comment('地址');
            $table->text('bio')->nullable()->comment('個人簡介');
            $table->string('avatar')->nullable()->comment('頭貼照片網址');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'birthday', 'address', 'bio', 'avatar']);
        });
    }
};