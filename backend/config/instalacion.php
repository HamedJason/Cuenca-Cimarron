<?php

return [
    // Huella SHA-256 de la clave de instalación. Con esa clave se crea el primer administrador
    // desde /#/configurar, una sola vez. La clave no está en el repositorio, solo su huella.
    'clave_hash' => env('CLAVE_INSTALACION_HASH', 'd4570669b4d046465d354de3566479108b7e3307265bfea7ac18f83e9cf766b5'),

    // Carpeta donde el servicio de respaldos deja una copia diaria de la base.
    'respaldos' => env('CARPETA_RESPALDOS', '/respaldos'),
];
