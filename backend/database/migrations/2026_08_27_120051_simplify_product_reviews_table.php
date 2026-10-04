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
        Schema::table('product_reviews', function (Blueprint $table) {
            // Ensure foreign keys exist (if not already)
            if (!Schema::hasColumn('product_reviews', 'product_id')) {
                $table->integer('product_id')->comment('關聯產品ID');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            }
            if (!Schema::hasColumn('product_reviews', 'user_id')) {
                $table->integer('user_id')->comment('評價者會員ID');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            // Ensure required columns exist
            if (!Schema::hasColumn('product_reviews', 'rating')) {
                $table->decimal('rating', 3, 2)->comment('評分(如: 5.0)');
            }
            if (!Schema::hasColumn('product_reviews', 'content')) {
                $table->text('content')->comment('評論內容');
            }
            if (!Schema::hasColumn('product_reviews', 'images')) {
                $table->json('images')->comment('評論附圖(陣列)');
            }
            if (!Schema::hasColumn('product_reviews', 'helpful')) {
                $table->integer('helpful')->default(0)->comment('覺得有幫助的人數');
            }
            if (!Schema::hasColumn('product_reviews', 'verified')) {
                $table->boolean('verified')->default(0)->comment('已認證買家');
            }

            // Remove columns that are no longer needed
            $table->dropColumn(['user_name', 'avatar']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            // Re-add removed columns with appropriate types
            $table->string('user_name')->nullable()->comment('使用者名稱');
            $table->string('avatar')->nullable()->comment('使用者頭像');

            // Note: Reverting foreign key changes is complex; we assume they remain.
            // If you need to drop them, adjust accordingly.
        });
    }
};