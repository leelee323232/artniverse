<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ER additions: preserve existing IDs and category names; no demo seeding.
        if (! Schema::hasTable('product_categories')) {
            Schema::create('product_categories', function (Blueprint $t): void {
                $t->string('id')->primary();
                $t->string('name');
                $t->boolean('is_active')->default(true);
                $t->unsignedInteger('sort_order')->default(0);
                $t->timestamps();
            });
            foreach (DB::table('products')->select('category_id', 'category')->orderBy('id')->get() as $row) {
                if (! $row->category_id || ! $row->category) continue;
                DB::table('product_categories')->insertOrIgnore([
                    'id' => $row->category_id, 'name' => $row->category,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
        foreach (['product_type', 'is_active', 'is_popular', 'sort_order', 'styles', 'sizes', 'colors', 'version', 'deleted_at', 'admin_request_key', 'admin_request_hash'] as $column) {
            if (Schema::hasColumn('products', $column)) continue;
            Schema::table('products', function (Blueprint $t) use ($column): void {
                match ($column) {
                    'product_type' => $t->string($column, 20)->default('general'),
                    'is_active' => $t->boolean($column)->default(true),
                    'is_popular' => $t->boolean($column)->default(false),
                    'sort_order' => $t->unsignedInteger($column)->default(0),
                    'version' => $t->unsignedInteger($column)->default(1),
                    'deleted_at' => $t->timestamp($column)->nullable(),
                    'admin_request_key' => $t->string($column, 64)->nullable()->unique(),
                    'admin_request_hash' => $t->string($column, 64)->nullable(),
                    default => $t->json($column)->nullable(),
                };
            });
        }
    }

    public function down(): void
    {
        // Forward-only: do not drop shared/existing fields or merchant data.
        throw new RuntimeException('商品管理 migration 請由 DBA 評估後回復，避免刪除既有資料。');
    }
};
