<?php

use App\Support\Catalog;
use Illuminate\Support\Facades\Artisan;

Artisan::command('actividades:sincronizar', function () {
    $total = Catalog::sync();
    $this->info("Actividades sincronizadas: {$total}");
})->purpose('Copia config/activities.php a la base de datos');
