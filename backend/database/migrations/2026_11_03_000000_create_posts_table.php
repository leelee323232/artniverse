<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ER: official and creator posts share content/images; their publishing endpoints differ.
        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->enum('author_type', ['official', 'creator']);
            // Keep historical posts if a creator is deleted; never reinterpret them as official.
            $table->foreignId('creator_id')->nullable()->constrained('creators')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('content');
            // Ordered R2 object paths and public URL snapshots, never client-supplied URLs.
            $table->json('images');
            $table->char('request_key', 64)->unique();
            $table->char('request_hash', 64);
            $table->unsignedInteger('version')->default(1);
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['deleted_at', 'created_at', 'id']);
            $table->index(['author_type', 'deleted_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
