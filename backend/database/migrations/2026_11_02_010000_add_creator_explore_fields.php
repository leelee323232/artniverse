<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ER additions for public creator cards; never copy applicants' legal names/documents.
        foreach (['planet_name', 'avatar_url', 'is_active'] as $column) {
            if (Schema::hasColumn('creators', $column)) continue;
            Schema::table('creators', function (Blueprint $table) use ($column): void {
                match ($column) {
                    'planet_name' => $table->string($column)->nullable(),
                    'avatar_url' => $table->text($column)->nullable(),
                    'is_active' => $table->boolean($column)->default(true),
                };
            });
        }
    }

    public function down(): void
    {
        throw new RuntimeException('請由 DBA 評估回復創作者公開欄位，避免刪除既有資料。');
    }
};
