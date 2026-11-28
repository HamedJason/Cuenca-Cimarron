<?php

namespace App\Support;

use App\Http\Controllers\SchoolCatalogController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\DB;

// Municipio de cada escuela registrada. La tabla schools no lo guarda: sale del catálogo de la SEP
// por la CCT y, si no tiene CCT o no está en el catálogo, de su punto en el mapa (la cabecera más cercana).
class SchoolMunicipality
{
    // [id de escuela => municipio con el nombre de la SEP]
    public static function all(): array
    {
        return DB::table('schools')
            ->leftJoin('school_catalog', 'school_catalog.cct', '=', 'schools.cct')
            ->get(['schools.id', 'schools.lat', 'schools.lng', 'school_catalog.municipality'])
            ->mapWithKeys(fn ($s) => [(int) $s->id => $s->municipality ?? StatsController::municipalityNear($s->lat, $s->lng)])
            ->all();
    }

    // Ids de las escuelas de un municipio. Acepta el nombre de la SEP o el de las zonas ("Rosarito").
    public static function idsIn(string $municipio): array
    {
        $name = SchoolCatalogController::municipalityName($municipio) ?? $municipio;

        return array_keys(array_filter(self::all(), fn ($m) => $m === $name));
    }
}
