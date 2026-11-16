<?php

return [
    // Huella SHA-256 de la clave de instalación. Con esa clave se crea el primer administrador
    // desde /#/configurar, una sola vez. La clave no está en el repositorio, solo su huella.
    'clave_hash' => env('CLAVE_INSTALACION_HASH', 'e00152516815bf08e08f807a0ce58e6ba52161411ae656e2cb89c0736a2ba290'),

    // Carpeta donde el servicio de respaldos deja una copia diaria de la base.
    'respaldos' => env('CARPETA_RESPALDOS', '/respaldos'),
];
