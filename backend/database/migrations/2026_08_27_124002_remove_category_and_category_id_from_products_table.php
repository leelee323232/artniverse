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
        Schema::table('products', function (Blueprint $table) {
            // 只在欄位存在時才刪除，避免重複執行時出錯
            if (Schema::hasColumn('products', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('products', 'category_id')) {
                $table->dropColumn('category_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 若需要回滾，可把這兩個欄位加回去（型別依照您之前的設定）
        Schema::table('products', function (Blueprint $table) {
            $table->string('category')->nullable()->after('image');
            $table->string('category_id')->nullable()->after('category');
        });
    }
};