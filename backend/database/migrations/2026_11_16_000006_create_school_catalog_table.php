<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Escuelas oficiales de Tijuana y Rosarito (Catálogo de Centros de Trabajo de la SEP),
    // para que una escuela se busque y se elija al registrarse.
    public function up(): void
    {
        Schema::create('school_catalog', function (Blueprint $table): void {
            $table->string('cct', 10)->primary();
            $table->string('name', 200);
            $table->string('name_search', 300)->index();
            $table->string('level', 20)->nullable();
            $table->string('level_detail', 60)->nullable();
            $table->string('shift', 20)->nullable();
            $table->string('sector', 10)->nullable();
            $table->string('colonia', 160)->nullable();
            $table->string('address', 220)->nullable();
            $table->string('postal_code', 5)->nullable();
            $table->string('municipality', 60);
            $table->decimal('lat', 9, 6)->nullable();
            $table->decimal('lng', 9, 6)->nullable();
            $table->timestampTz('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_catalog');
    }
};
