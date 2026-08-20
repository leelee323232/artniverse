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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('產品名稱');
            $table->decimal('price', 10, 2)->comment('售價');
            $table->decimal('original_price', 10, 2)->nullable()->comment('原價');
            $table->json('image')->comment('圖片清單/網址(陣列)');
            $table->string('category')->comment('產品分類名稱');
            $table->string('category_id')->comment('產品分類ID');
            $table->integer('stock')->default(0)->comment('庫存量');
            $table->integer('sold')->default(0)->comment('銷售量');
            $table->decimal('rating', 3, 2)->default(0.00)->comment('評分');
            $table->integer('review_count')->default(0)->comment('評論數');
            $table->integer('creator_id')->comment('創作者ID');
            $table->string('creator_name')->comment('創作者名稱');
            $table->text('description')->comment('產品描述');
            $table->json('features')->comment('產品特色(陣列)');
            $table->json('specifications')->comment('產品規格(物件)');
            $table->tinyInteger('is_new')->default(0)->comment('是否為新品');
            $table->tinyInteger('is_creator_product')->default(0)->comment('是否為創作者專屬商品');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
