<?php

// Demo para la exposición del 20 de noviembre (/testeo_20nov).
// Apagada por defecto. Se enciende con DEMO_20NOV=true en el .env del servidor.
return [
    'enabled' => filter_var(env('DEMO_20NOV', false), FILTER_VALIDATE_BOOLEAN),
    // Todas las cuentas demo usan este dominio reservado: así se encuentran y se borran sin tocar nada real.
    'domain' => 'demo-20nov.invalid',
    // Códigos de los dos grupos demo (si alguno ya existe en un grupo real se usa otro al azar).
    'codes' => ['201120', '201121'],
];
