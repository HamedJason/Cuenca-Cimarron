<?php

namespace Database\Seeders;

use App\Support\DemoData;
use Illuminate\Database\Seeder;

// Datos demo para la exposición: php artisan db:seed --class=Demo20NovSeeder --force
// Se puede correr varias veces: borra lo demo anterior y lo vuelve a crear.
// Para borrarlo todo: php artisan demo:borrar
class Demo20NovSeeder extends Seeder
{
    public function run(): void
    {
        $result = DemoData::seed();
        $this->command?->info('Demo lista. Códigos de grupo: '.implode(', ', $result['codes']).'. Alumnos: '.$result['students']);
    }
}
