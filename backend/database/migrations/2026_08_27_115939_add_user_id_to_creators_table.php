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
        Schema::table('creators', function (Blueprint $table) {
            // If column already exists, drop it to recreate with correct type
            if (Schema::hasColumn('creators', 'user_id')) {
                $table->dropColumn('user_id');
            }
            $table->unsignedBigInteger('user_id')
                  ->unique()
                  ->nullable()
                  ->after('id')
                  ->comment('對應的會員ID(僅當會員開通創作者時有值)');
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};