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
        Schema::create('product_category_specs', function (Blueprint $table) {
            $table->string('id')->primary()->comment('類別規格ID');
            $table->string('name')->comment('類別英文代碼/名稱');
            $table->string('name_zh')->comment('類別中文名稱');
            $table->decimal('base_cost', 10, 2)->comment('基本成本/底價');
            $table->integer('min_order')->comment('最小訂購量');
            $table->boolean('has_min_quantity')->comment('是否有起訂量限制');
            $table->json('print_zones')->comment('印刷區域設定(陣列)');
            $table->json('specs')->comment('類別規格說明定義(陣列)');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_category_specs');
    }
};