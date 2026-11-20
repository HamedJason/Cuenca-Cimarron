<?php

use App\Http\Controllers\SchoolCatalogController;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// La SEP marca en el centro de Tijuana (Zona Río) las escuelas de las que no sabe la ubicación.
// Ese punto no es la escuela: se borra del catálogo y de las escuelas que se registraron con él,
// para que el mapa no las ponga ahí y la escuela marque su lugar.
return new class extends Migration
{
    public function up(): void
    {
        [$lat, $lng] = SchoolCatalogController::UNKNOWN_POINT;
        foreach (['school_catalog', 'schools'] as $table) {
            DB::table($table)
                ->whereBetween('lat', [$lat - 0.00005, $lat + 0.00005])
                ->whereBetween('lng', [$lng - 0.00005, $lng + 0.00005])
                ->update(['lat' => null, 'lng' => null]);
        }
    }

    public function down(): void
    {
        // No se puede saber cuáles tenían el punto de la SEP
    }
};
