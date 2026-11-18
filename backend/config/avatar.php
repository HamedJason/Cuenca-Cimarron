<?php

// Kit de avatares (Mi cimarrón) para los alumnos con sesión.
// avatar-catalogo.json se genera desde el frontend con `node scripts/catalogo-avatar.mjs`
// (precios, piezas iniciales, kits, premios, retos y secreto). No se edita a mano.
// Ver docs/avatar-cimarron.md.
$catalog = json_decode((string) file_get_contents(__DIR__.'/avatar-catalogo.json'), true, flags: JSON_THROW_ON_ERROR);

return $catalog + [
    // Día de los premios diarios (visita del día, reto diario).
    'timezone' => 'America/Tijuana',
];
