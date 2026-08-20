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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->integer('product_id')->comment('關聯產品ID');
            $table->string('user_id')->comment('評價者會員ID');
            $table->string('user_name')->comment('使用者名稱');
            $table->string('avatar')->comment('使用者頭像');
            $table->decimal('rating', 3, 2)->comment('評分(如: 5.0)');
            $table->text('content')->comment('評論內容');
            $table->json('images')->comment('評論附圖(陣列)');
            $table->integer('helpful')->default(0)->comment('覺得有幫助的人數');
            $table->tinyInteger('verified')->default(0)->comment('已認證買家');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
