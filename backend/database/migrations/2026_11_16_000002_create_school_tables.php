<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 20)->default('school')->index();
        });
        Schema::create('schools', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name', 160);
            $table->string('cct', 10)->nullable()->unique();
            $table->string('level', 20);
            $table->string('shift', 20);
            $table->string('sector', 10);
            $table->string('colonia', 120);
            $table->string('address', 200);
            $table->decimal('lat', 9, 6)->nullable();
            $table->decimal('lng', 9, 6)->nullable();
            $table->string('contact_name', 120);
            $table->string('status', 12)->default('pending')->index();
            $table->string('rejection_reason', 300)->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->timestampTz('families_informed_at');
            $table->timestampsTz();
        });
        Schema::create('account_tokens', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->char('token_hash', 64)->unique();
            $table->timestampTz('expires_at');
            $table->timestampTz('used_at')->nullable();
            $table->timestampTz('created_at');
        });
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('actor_type', 20);
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('action', 60);
            $table->string('subject_type', 40)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('details')->nullable();
            $table->timestampTz('created_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('account_tokens');
        Schema::dropIfExists('schools');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('role');
        });
    }
};
