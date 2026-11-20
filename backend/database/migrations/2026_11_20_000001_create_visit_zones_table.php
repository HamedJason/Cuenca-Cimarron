<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Desde dónde nos visitan: solo un contador por día, municipio y zona aproximada.
// Sin IP, sin coordenadas y sin relación con alumnos, escuelas o sesiones.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_zones', function (Blueprint $table): void {
            $table->id();
            $table->date('day');
            $table->string('municipio', 40);
            $table->string('zona', 60);
            $table->unsignedInteger('visits')->default(0);
            $table->unique(['day', 'municipio', 'zona']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_zones');
    }
};
