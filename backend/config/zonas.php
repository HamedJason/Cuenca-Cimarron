<?php

// Zonas aproximadas de los visitantes (POST /api/visitas/zona).
// El navegador redondea su ubicación y la convierte en una de estas zonas: nunca manda coordenadas.
// Las delegaciones de Tijuana son las de la policía municipal (frontend/src/data.js, policeStations)
// y deben coincidir con frontend/src/zonas.js.
return [
    'municipios' => ['Tijuana', 'Rosarito', 'Tecate', 'Ensenada', 'Mexicali', 'San Quintín', 'San Felipe', 'Fuera de Baja California'],
    'tijuana' => [
        'Zona Centro', 'Los Pinos', 'Playas', 'Cerro Colorado', 'La Presa', 'San Antonio de los Buenos',
        'Mesa de Otay', 'Centenario', 'Presa Rural', 'Natura',
    ],
];
