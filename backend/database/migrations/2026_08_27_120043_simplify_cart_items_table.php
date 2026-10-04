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
        Schema::table('cart_items', function (Blueprint $table) {
            // Ensure primary key is string id (if not already)
            if (!Schema::hasColumn('cart_items', 'id')) {
                $table->string('id')->primary()->comment('購物車明細ID');
            } else {
                // If id exists but not primary key or not string, we adjust.
                // For simplicity, we assume it's already correct; otherwise manual intervention needed.
            }

            // Ensure required columns exist
            if (!Schema::hasColumn('cart_items', 'user_id')) {
                $table->integer('user_id')->comment('會員ID');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('cart_items', 'product_id')) {
                $table->integer('product_id')->comment('產品ID');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            }
            if (!Schema::hasColumn('cart_items', 'quantity')) {
                $table->integer('quantity')->comment('數量');
            }

            // Remove columns that are no longer needed
            $table->dropColumn(['name', 'price', 'image', 'creator_name', 'creator_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Re-add removed columns with appropriate types (based on previous spec)
            $table->string('name')->nullable()->comment('產品名稱');
            $table->decimal('price', 10, 2)->nullable()->comment('售價');
            $table->json('image')->nullable()->comment('圖片清單/網址(陣列)');
            $table->string('creator_name')->nullable()->comment('創作者名稱');
            $table->integer('creator_id')->nullable()->comment('創作者ID');

            // Note: Reverting primary key changes is complex; we assume id remains as is.
            // If you changed the primary key type, you would need to handle it here.
        });
    }
};