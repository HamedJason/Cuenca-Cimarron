<?php

// Caminos predeterminados: listas de actividades que el docente asigna a su grupo con un clic.
// Las claves son las de config/activities.php. Se pueden cambiar sin tocar el código.

return [
    [
        'key' => 'conoce-el-nino',
        'title' => 'Conoce El Niño',
        'description' => 'Qué es El Niño y qué riesgos trae a Tijuana',
        'activities' => ['lectura-conozca', 'modulo-nino-tijuana', 'modulo-riesgo-lluvias', 'modulo-riesgo-deslaves', 'modulo-riesgo-inundaciones', 'cinco-segundos'],
    ],
    [
        'key' => 'plan-familiar',
        'title' => 'Plan familiar',
        'description' => 'Los cuatro pasos para armar el plan en casa',
        'activities' => ['lectura-planfamiliar', 'modulo-plan-riesgos', 'modulo-plan-rutas', 'modulo-plan-tareas', 'modulo-plan-practica', 'mision-tijuana'],
    ],
    [
        'key' => 'mochila-y-botiquin',
        'title' => 'Mochila y botiquín',
        'description' => 'Qué llevar para salir rápido y cómo cuidarse',
        'activities' => ['lectura-mochila', 'modulo-mochila-esencial', 'modulo-mochila-documentos', 'modulo-mochila-familia', 'lectura-salud', 'mochila'],
    ],
    [
        'key' => 'durante-la-tormenta',
        'title' => 'Qué hacer en la tormenta',
        'description' => 'Antes, durante, manejando y después, y cómo pedir ayuda',
        'activities' => ['consejo-antes', 'consejo-durante', 'consejo-manejo', 'consejo-despues', 'alerta-911', 'novela-visual'],
    ],
    [
        'key' => 'juega-y-aprende',
        'title' => 'Juega y aprende',
        'description' => 'Todos los juegos del sitio',
        'activities' => ['mision-tijuana', 'alerta-911', 'novela-visual', 'cinco-segundos', 'cien-estudiantes', 'mochila'],
    ],
];
