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
        Schema::table('creators', function (Blueprint $table) {
            // 1️⃣ 加入唯一索引（如果尚未存在）
            if (!Schema::hasIndex('creators', 'creators_user_id_unique')) {
                $table->unique('user_id')->nullableChange(); // 保持 nullable
            }

            // 2️⃣ 加入外鍵約束（如果尚未存在）
            // 先嘗試移除可能存在的外鍵（忽略錯誤），再添加
            try {
                $table->dropForeign(['user_id']);
            } catch (\Throwable $e) {
                // 外鍵可能不存在，忽略
            }
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
        });
    }
};