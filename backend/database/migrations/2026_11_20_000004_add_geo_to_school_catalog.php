<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// De dónde salió el punto de cada escuela del catálogo: sep (catálogo de la SEP),
// inegi (DENUE, mismo nombre y dirección) o aprox (DENUE, solo el nombre coincide).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_catalog', function (Blueprint $table): void {
            $table->string('geo', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('school_catalog', function (Blueprint $table): void {
            $table->dropColumn('geo');
        });
    }
};
