<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->boolean('active')->default(true);
            $table->timestampsTz();
        });
        Schema::create('teacher_invites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->char('token_hash', 64)->unique();
            $table->timestampTz('expires_at');
            $table->timestampTz('used_at')->nullable();
            $table->timestampTz('created_at');
        });
        Schema::create('classrooms', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->string('name', 60);
            $table->string('grade', 30);
            // Código de 6 números. Al archivar el grupo se libera (queda vacío) para otro grupo.
            $table->char('code', 6)->nullable()->unique();
            $table->boolean('open')->default(true);
            $table->string('school_year', 9);
            $table->timestampTz('archived_at')->nullable();
            $table->timestampsTz();
        });
        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->string('name', 30);
            $table->string('name_key', 40);
            // Código personal de regreso: huella para buscarlo y copia cifrada para que el docente lo vea.
            $table->char('return_code_hash', 64)->nullable()->unique();
            $table->text('return_code_encrypted')->nullable();
            $table->json('avatar')->nullable();
            $table->timestampTz('anonymized_at')->nullable();
            $table->timestampsTz();
            $table->unique(['classroom_id', 'name_key']);
        });
        Schema::create('device_sessions', function (Blueprint $table): void {
            $table->id();
            $table->string('kind', 10);
            $table->unsignedBigInteger('owner_id');
            $table->char('token_hash', 64)->unique();
            $table->date('last_used_on');
            $table->timestampTz('expires_at')->index();
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('created_at');
            $table->index(['kind', 'owner_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sessions');
        Schema::dropIfExists('students');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('teacher_invites');
        Schema::dropIfExists('teachers');
    }
};
