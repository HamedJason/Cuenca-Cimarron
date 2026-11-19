<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Cimarrón del docente: tiene todas las piezas desbloqueadas, sin monedas.
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table): void {
            $table->json('avatar')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table): void {
            $table->dropColumn('avatar');
        });
    }
};
