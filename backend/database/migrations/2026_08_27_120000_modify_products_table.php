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
            // Handle category_spec_id
            if (!Schema::hasColumn('products', 'category_spec_id')) {
                $table->string('category_spec_id')->nullable()->after('creator_id')
                    ->comment('對應商品類別規格ID');
                $table->foreign('category_spec_id')
                      ->references('id')
                      ->on('product_category_specs')
                      ->onDelete('set null');
            }
            // If column already exists, assume foreign key is already present; do nothing.

            // Ensure creator_id column exists and is unsignedBigInteger
            if (!Schema::hasColumn('products', 'creator_id')) {
                $table->unsignedBigInteger('creator_id')
                      ->comment('創作者ID');
                $table->foreign('creator_id')
                      ->references('id')
                      ->on('creators')
                      ->onDelete('cascade');
            } else {
                // Column exists; ensure it's unsignedBigInteger
                $table->unsignedBigInteger('creator_id')
                      ->change()
                      ->comment('創作者ID');
                // Ensure foreign key exists (try add, ignore duplicate)
                try {
                    $table->foreign('creator_id')
                          ->references('id')
                          ->on('creators')
                          ->onDelete('cascade');
                } catch (\Throwable $e) {
                    if (strpos($e->getMessage(), 'Duplicate foreign key constraint name') === false) {
                        throw $e;
                    }
                }
            }

            // Optionally drop creator_name if it exists and is not needed
            if (Schema::hasColumn('products', 'creator_name')) {
                $table->dropColumn('creator_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_spec_id']);
            $table->dropColumn('category_spec_id');
            // We won't revert creator_id changes here to avoid breaking existing data.
            // Re-add creator_name if it was dropped
            if (!Schema::hasColumn('products', 'creator_name')) {
                $table->string('creator_name')->nullable();
            }
        });
    }
};