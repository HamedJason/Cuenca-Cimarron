<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Código postal de la escuela: ayuda a poner el punto del mapa cerca cuando no hay ubicación exacta
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table): void {
            $table->string('postal_code', 5)->nullable()->after('address');
        });
        // Las escuelas ya registradas con CCT del catálogo toman su código postal de ahí
        DB::table('schools')->whereNotNull('cct')->orderBy('id')->each(function ($school): void {
            $cp = DB::table('school_catalog')->where('cct', $school->cct)->value('postal_code');
            if ($cp && $cp !== '00000') {
                DB::table('schools')->where('id', $school->id)->update(['postal_code' => $cp]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table): void {
            $table->dropColumn('postal_code');
        });
    }
};
