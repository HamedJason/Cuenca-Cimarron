<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Cartera de Cimacoins del alumno: lo gastado, premios recibidos y su colección de cosméticos.
// El avatar sigue en students.avatar, ahora con una pieza por grupo ({"cabeza": "casco-verde", ...}).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table): void {
            $table->json('wallet')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table): void {
            $table->dropColumn('wallet');
        });
    }
};
