<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'is_admin')) {
            Schema::table('users', fn (Blueprint $t) => $t->boolean('is_admin')->default(false));
        }
        if (! Schema::hasColumn('creators', 'user_id')) {
            Schema::table('creators', function (Blueprint $t): void {
                $t->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            });
        }
        if (! Schema::hasIndex('creators', ['user_id'], 'unique')) {
            // Existing duplicates must be resolved by DBA, never silently merged.
            Schema::table('creators', fn (Blueprint $t) => $t->unique('user_id', 'creators_user_id_unique'));
        }
        if (! Schema::hasTable('creator_applications')) {
            Schema::create('creator_applications', function (Blueprint $t): void {
                $t->id();
                $t->foreignId('user_id')->constrained()->restrictOnDelete();
                $t->string('email');
                $t->string('real_name');
                $t->string('brand_name');
                $t->text('store_pickup');
                $t->string('phone', 32);
                $t->date('birthday');
                $t->string('address');
                $t->string('bank_code');
                $t->string('bank_account');
                $t->json('selected_categories');
                $t->text('creative_philosophy');
                // ER change: these are PRIVATE object keys, not public URLs.
                $t->text('id_front_image');
                $t->text('id_back_image');
                $t->boolean('agree_to_contract');
                $t->string('status', 20)->default('pending');
                $t->text('review_note')->nullable();
                $t->timestamps();
                $t->index(['user_id', 'status']);
            });
        }
        // Fail clearly if a deployment uses a different legacy base schema.
        foreach (['user_id', 'email', 'real_name', 'brand_name', 'store_pickup', 'phone', 'birthday', 'address', 'bank_code', 'bank_account', 'selected_categories', 'creative_philosophy', 'id_front_image', 'id_back_image', 'agree_to_contract', 'status', 'created_at', 'updated_at'] as $column) {
            if (! Schema::hasColumn('creator_applications', $column)) {
                throw new RuntimeException("creator_applications.$column is missing; ask DBA to reconcile the existing ER before retrying.");
            }
        }
        foreach (['review_note', 'document_disk', 'contract_version', 'contract_hash', 'contract_snapshot', 'consented_at', 'request_key', 'request_hash', 'reviewed_by', 'reviewed_at', 'version'] as $column) {
            if (Schema::hasColumn('creator_applications', $column)) continue;
            Schema::table('creator_applications', function (Blueprint $t) use ($column): void {
                match ($column) {
                    'review_note' => $t->text($column)->nullable(),
                    'document_disk' => $t->string($column, 32)->nullable(),
                    'contract_version' => $t->string($column, 64)->nullable(),
                    'contract_hash', 'request_hash' => $t->string($column, 64)->nullable(),
                    'contract_snapshot' => $t->longText($column)->nullable(),
                    'consented_at', 'reviewed_at' => $t->timestamp($column)->nullable(),
                    'request_key' => $t->uuid($column)->nullable(),
                    'reviewed_by' => $t->foreignId($column)->nullable()->constrained('users')->nullOnDelete(),
                    'version' => $t->unsignedInteger($column)->default(1),
                };
            });
        }
        if (! Schema::hasIndex('creator_applications', ['user_id', 'request_key'], 'unique')) {
            Schema::table('creator_applications', fn (Blueprint $t) => $t->unique(['user_id', 'request_key'], 'creator_app_user_request_unique'));
        }
        if (! Schema::hasTable('creator_application_reviews')) {
            Schema::create('creator_application_reviews', function (Blueprint $t): void {
                $t->id();
                $t->foreignId('application_id')->constrained('creator_applications')->restrictOnDelete();
                $t->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
                $t->string('from_status', 20);
                $t->string('to_status', 20);
                $t->text('reason')->nullable();
                $t->timestamp('created_at');
            });
        }
    }

    public function down(): void
    {
        throw new RuntimeException('DBA review required: do not automatically delete creator applications or identity-document records.');
    }
};
