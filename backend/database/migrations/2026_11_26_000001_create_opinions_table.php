<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Comunidad Cimarrona: opiniones anónimas. Sin IP, sin usuario, sin alumno y sin escuela.
// La hora se guarda redondeada a 10 minutos para que no se pueda cruzar con otros registros.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opinions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedTinyInteger('rating');
            $table->string('comment', 500)->nullable();
            // comunidad (la página) o actividad (al terminar un juego o una lectura)
            $table->string('origin', 12)->default('comunidad');
            // filtro (groserías o enlaces) o admin (lo ocultó la administración)
            $table->string('hidden_reason', 10)->nullable();
            $table->timestampTz('created_at')->index();
            $table->index(['hidden_reason', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opinions');
    }
};
