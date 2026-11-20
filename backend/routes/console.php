<?php

use App\Http\Controllers\SchoolCatalogController;
use App\Support\Catalog;
use App\Support\DemoData;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('actividades:sincronizar', function () {
    $total = Catalog::sync();
    $this->info("Actividades sincronizadas: {$total}");
    // Corre en cada arranque del backend: aprovecha para cargar el catálogo de escuelas si hace falta.
    $schools = SchoolCatalogController::ensureBundled();
    if ($schools !== null) {
        $this->info("Escuelas en el catálogo: {$schools}");
    }
})->purpose('Copia config/activities.php a la base de datos y carga el catálogo de escuelas si hace falta');

Artisan::command('demo:borrar', function () {
    DemoData::wipe();
    $this->info('Datos demo borrados');
})->purpose('Borra las cuentas, escuelas, grupos, alumnos y visitas de la demo del 20 de noviembre');

Artisan::command('escuelas:catalogo {--si-vacio : Solo si está vacío o si cambió el archivo}', function () {
    $total = SchoolCatalogController::ensureBundled(force: ! $this->option('si-vacio'));
    if ($total === null) {
        $this->info('El catálogo de escuelas ya está cargado');

        return;
    }
    $this->info("Escuelas en el catálogo: {$total}");
})->purpose('Carga el catálogo de escuelas de Tijuana y Rosarito que viene en database/data');
