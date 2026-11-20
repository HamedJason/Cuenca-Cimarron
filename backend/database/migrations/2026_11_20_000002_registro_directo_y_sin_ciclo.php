<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Las escuelas ya no pasan por revisión: al registrarse tienen acceso de inmediato.
// Las que esperaban revisión quedan registradas y las rechazadas quedan suspendidas
// (conservan el motivo, que ahora se ve como motivo de la suspensión).
// También se quita el ciclo escolar de los grupos: ya no se usa en ningún lado.
return new class extends Migration
{
    public function up(): void
    {
        DB::table('schools')->where('status', 'pending')->update(['status' => 'approved']);
        DB::table('schools')->where('status', 'rejected')->update(['status' => 'suspended']);
        if (Schema::hasColumn('classrooms', 'school_year')) {
            Schema::table('classrooms', function (Blueprint $table): void {
                $table->dropColumn('school_year');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('classrooms', 'school_year')) {
            Schema::table('classrooms', function (Blueprint $table): void {
                $table->string('school_year', 9)->nullable();
            });
        }
    }
};
