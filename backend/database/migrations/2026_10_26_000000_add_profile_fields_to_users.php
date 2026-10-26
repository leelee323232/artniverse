<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ER adjustment: optional profile fields, plus the public R2 avatar URL.
        // Some deployments may already have these columns; preserve their data.
        foreach (['phone', 'birthday', 'address', 'bio', 'avatar'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                continue;
            }
            Schema::table('users', function (Blueprint $table) use ($column): void {
                match ($column) {
                    'phone' => $table->string('phone', 32)->nullable(),
                    'birthday' => $table->date('birthday')->nullable(),
                    'address' => $table->string('address', 200)->nullable(),
                    'bio' => $table->text('bio')->nullable(),
                    'avatar' => $table->text('avatar')->nullable(),
                };
            });
        }
    }

    public function down(): void
    {
        // Cannot identify pre-existing columns safely; never drop member data.
        throw new RuntimeException('Profile migration rollback requires DBA review; existing users columns must be preserved.');
    }
};
