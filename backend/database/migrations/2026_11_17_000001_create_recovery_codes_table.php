<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Códigos de recuperación: con uno se pone contraseña nueva sin correo. Cada uno sirve una vez.
    public function up(): void
    {
        Schema::create('recovery_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->char('code_hash', 64);
            $table->timestampTz('used_at')->nullable();
            $table->timestampTz('created_at');
            $table->unique(['user_id', 'code_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recovery_codes');
    }
};
