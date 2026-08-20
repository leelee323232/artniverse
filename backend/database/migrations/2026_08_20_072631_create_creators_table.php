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
        Schema::create('creators', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('創作者名稱');
            $table->text('description')->comment('創作者簡介');
            $table->json('tags')->comment('標籤');
            $table->integer('followers')->default(0)->comment('粉絲人數');
            $table->decimal('rating', 3, 2)->default(0.00)->comment('評分');
            $table->integer('total_reviews')->default(0)->comment('總評論數');
            $table->string('color', 7)->nullable()->comment('主視覺色碼');
            $table->json('super_subscription')->nullable()->comment('超級訂閱設定');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creators');
    }
};
