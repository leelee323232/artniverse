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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->string('id')->primary()->comment('購物車明細ID');
            $table->string('user_id')->comment('會員ID');
            $table->integer('product_id')->comment('產品ID');
            $table->string('name')->comment('產品名稱');
            $table->decimal('price', 10, 2)->comment('售價');
            $table->integer('quantity')->comment('數量');
            $table->string('image')->comment('圖片網址');
            $table->string('creator_name')->comment('創作者名稱');
            $table->integer('creator_id')->comment('創作者ID');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
