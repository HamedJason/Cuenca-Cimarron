<?php

// Catálogo de actividades que dan puntos. Al arrancar la API se copia a la tabla activities
// (php artisan actividades:sincronizar), así el frontend lo pide por API y hay una sola lista.
//
// Tipos (kind): lectura, modulo (lectura corta de /aprende), consejo, juego y externo.
//
// Modos:
// - pregunta: lecturas y consejos. Se contesta una pregunta al final y, si es correcta, suma.
// - aviso: juegos propios. El juego avisa al terminar con CuencaPuntos.terminar(clave).
//   El servidor pide que antes se haya registrado el inicio y que haya pasado el tiempo mínimo.
// - externo: juegos de otros sitios. Al regresar se revisa el tiempo fuera y se hace una pregunta.
//
// La respuesta correcta (answer) es el número de opción empezando en 0 y nunca sale al navegador.
// Las preguntas son una primera propuesta para que el equipo las revise.

return [
    [
        'key' => 'lectura-conozca',
        'title' => 'Qué es El Niño',
        'kind' => 'lectura',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/informacion?tema=conozca',
        'question' => [
            'text' => '¿Qué es El Niño?',
            'options' => [
                'Un calentamiento del océano Pacífico que cambia la lluvia y el clima',
                'Una tormenta que llega a Tijuana todos los años en la misma fecha',
                'Un aviso que manda Protección Civil cuando va a llover',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'lectura-planfamiliar',
        'title' => 'Haz tu plan familiar',
        'kind' => 'lectura',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/informacion?tema=planfamiliar',
        'question' => [
            'text' => '¿Qué deben acordar en familia en su plan?',
            'options' => [
                'Solo el teléfono del 911',
                'Rutas para salir, un punto de encuentro y qué le toca a cada quien',
                'Quién se queda a cuidar la casa aunque haya peligro',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'lectura-mochila',
        'title' => 'Prepara tu mochila',
        'kind' => 'lectura',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/informacion?tema=mochila',
        'question' => [
            'text' => '¿Cómo se guardan los documentos en la mochila de emergencia?',
            'options' => [
                'Los originales sueltos, para tenerlos a la mano',
                'No hace falta llevar documentos',
                'Copias en una bolsa que no deje pasar el agua',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'lectura-salud',
        'title' => 'Botiquín y salud',
        'kind' => 'lectura',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/informacion?tema=salud',
        'question' => [
            'text' => '¿Qué va en el botiquín de la casa?',
            'options' => [
                'Medicinas de todos, sin receta, para lo que se ofrezca',
                'Material para curar y limpiar heridas. Las medicinas van aparte, con su receta',
                'Solo curitas, lo demás lo da el hospital',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'modulo-nino-tijuana',
        'title' => 'El Niño en Tijuana',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/nino-tijuana',
        'question' => [
            'text' => '¿Una tormenta sola quiere decir que ya llegó El Niño?',
            'options' => [
                'Sí, siempre que llueve fuerte',
                'No. Hay que seguir los avisos del clima y de Protección Civil',
                'Solo si llueve de noche',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'modulo-riesgo-lluvias',
        'title' => 'Lluvias fuertes',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/riesgo-lluvias',
        'question' => [
            'text' => 'Con lluvia fuerte, ¿qué puede pasar en poco tiempo?',
            'options' => [
                'No cambia nada si es de día',
                'El agua se va sola',
                'Se pierde visibilidad y el suelo se satura',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'modulo-riesgo-deslaves',
        'title' => 'Deslaves',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/riesgo-deslaves',
        'question' => [
            'text' => '¿Dónde se puede venir abajo la tierra mojada?',
            'options' => [
                'En laderas y cañadas',
                'En la playa',
                'En las calles planas',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'modulo-riesgo-inundaciones',
        'title' => 'Inundaciones',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/riesgo-inundaciones',
        'question' => [
            'text' => 'Un arroyo o un paso a desnivel se está llenando. ¿Qué haces?',
            'options' => [
                'Lo cruzo rápido',
                'No lo cruzo nunca',
                'Lo cruzo si hay poca agua',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'modulo-plan-riesgos',
        'title' => 'Plan familiar: ubiquen los riesgos',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/plan-riesgos',
        'question' => [
            'text' => '¿Qué hacen primero para su plan familiar?',
            'options' => [
                'Comprar comida para un mes',
                'Recorrer la casa y encontrar las zonas seguras',
                'Esperar a que llueva',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'modulo-plan-rutas',
        'title' => 'Plan familiar: rutas y punto de encuentro',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/plan-rutas',
        'question' => [
            'text' => '¿Para qué sirve el punto de encuentro?',
            'options' => [
                'Para verse si no pueden quedarse en casa',
                'Para guardar la mochila',
                'Para jugar después de la lluvia',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'modulo-plan-tareas',
        'title' => 'Plan familiar: repartan tareas',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/plan-tareas',
        'question' => [
            'text' => '¿Por qué se reparten tareas en familia?',
            'options' => [
                'Para que una sola persona haga todo',
                'No hace falta repartirlas',
                'Para que cada quien sepa qué le toca y cómo avisar',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'modulo-plan-practica',
        'title' => 'Plan familiar: practiquen',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/plan-practica',
        'question' => [
            'text' => '¿Para qué es un simulacro?',
            'options' => [
                'Para aprender y ajustar el plan',
                'Para ver quién gana',
                'Para asustar a la familia',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'modulo-mochila-esencial',
        'title' => 'Mochila: lo esencial',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/mochila-esencial',
        'question' => [
            'text' => '¿Qué va en lo esencial de la mochila?',
            'options' => [
                'Juguetes y videojuegos',
                'Agua, comida, botiquín y linterna',
                'Ropa de fiesta',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'modulo-mochila-documentos',
        'title' => 'Mochila: comunicación y documentos',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/mochila-documentos',
        'question' => [
            'text' => '¿Para qué llevar un radio de pilas?',
            'options' => [
                'Para escuchar música',
                'No sirve en una emergencia',
                'Para oír los avisos oficiales',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'modulo-mochila-familia',
        'title' => 'Mochila: cuidado de tu familia',
        'kind' => 'modulo',
        'mode' => 'pregunta',
        'points' => 10,
        'route' => '/aprende/mochila-familia',
        'question' => [
            'text' => '¿Para qué sirve el silbato de la mochila?',
            'options' => [
                'Para pedir ayuda',
                'Para jugar en el camino',
                'Para despertar a la familia',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'consejo-antes',
        'title' => 'Consejos: antes de la lluvia',
        'kind' => 'consejo',
        'mode' => 'pregunta',
        'points' => 5,
        'route' => '/consejos?momento=antes',
        'question' => [
            'text' => '¿Qué conviene revisar antes de que empiece a llover?',
            'options' => [
                'Coladeras, techos y cables sueltos',
                'Que el carro tenga gasolina para salir a ver la lluvia',
                'Nada, es mejor esperar a que llueva',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'consejo-durante',
        'title' => 'Consejos: durante la tormenta',
        'kind' => 'consejo',
        'mode' => 'pregunta',
        'points' => 5,
        'route' => '/consejos?momento=durante',
        'question' => [
            'text' => 'Durante la tormenta ves un arroyo con poca agua. ¿Qué haces?',
            'options' => [
                'Lo cruzo rápido porque el agua se ve baja',
                'No lo cruzo, aunque el agua se vea baja',
                'Lo cruzo si voy con alguien más',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'consejo-manejo',
        'title' => 'Consejos: si vas manejando',
        'kind' => 'consejo',
        'mode' => 'pregunta',
        'points' => 5,
        'route' => '/consejos?momento=manejo',
        'question' => [
            'text' => 'Van en carro y el agua tapa la calle. ¿Qué es lo correcto?',
            'options' => [
                'Acelerar para pasar antes de que suba más',
                'Seguir al carro de adelante',
                'Detenerse en un lugar seguro y buscar otra ruta',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'consejo-despues',
        'title' => 'Consejos: después de la lluvia',
        'kind' => 'consejo',
        'mode' => 'pregunta',
        'points' => 5,
        'route' => '/consejos?momento=despues',
        'question' => [
            'text' => 'Después de la lluvia encuentras un cable caído. ¿Qué haces?',
            'options' => [
                'No me acerco, no lo toco y reporto el riesgo',
                'Lo muevo con un palo para que nadie se tropiece',
                'Lo ignoro, ya dejó de llover',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'mision-tijuana',
        'title' => 'Misión Tijuana',
        'kind' => 'juego',
        'mode' => 'aviso',
        'points' => 20,
        // Cuenta como una sola actividad: suma al terminar cualquiera de sus misiones.
        'min_seconds' => 120,
        'route' => '/juegos?juego=mision-tijuana',
    ],
    [
        'key' => 'alerta-911',
        'title' => 'Alerta 911: Misión El Niño',
        'kind' => 'externo',
        'mode' => 'externo',
        'points' => 10,
        'min_seconds' => 180,
        'route' => '/juegos?juego=alerta-911',
        'question' => [
            'text' => 'Al llamar al 911, ¿qué es lo primero que tienes que decir?',
            'options' => [
                'Mi nombre completo y mi edad',
                'Qué pasa y dónde estoy',
                'Que manden a todos rápido',
            ],
            'answer' => 1,
        ],
    ],
    [
        // La versión web exportada todavía no avisa sola al llegar a un final. Por eso usa el
        // modo externo. Cuando se vuelva a exportar con el aviso de script.rpy, se cambia a aviso.
        'key' => 'novela-visual',
        'title' => 'Un paso en falso: El Niño',
        'kind' => 'juego',
        'mode' => 'externo',
        'points' => 20,
        'min_seconds' => 300,
        'route' => '/juegos?juego=novela-visual',
        'question' => [
            'text' => 'En la historia encuentras un cable caído en la calle mojada. ¿Qué es lo seguro?',
            'options' => [
                'Alejarte y avisar a las autoridades',
                'Pasar rápido por un lado',
                'Moverlo para que no le pase nada a nadie',
            ],
            'answer' => 0,
        ],
    ],
    [
        'key' => 'cinco-segundos',
        'title' => '5 segundos: Alerta El Niño',
        'kind' => 'externo',
        'mode' => 'externo',
        'points' => 10,
        'min_seconds' => 120,
        'route' => '/juegos?juego=cinco-segundos',
        'question' => [
            'text' => 'Además de lluvias fuertes, ¿qué otro problema puede traer El Niño?',
            'options' => [
                'Nevadas en toda la ciudad',
                'Temblores',
                'Sequía en otras temporadas',
            ],
            'answer' => 2,
        ],
    ],
    [
        'key' => 'cien-estudiantes',
        'title' => '100 estudiantes dijeron',
        'kind' => 'externo',
        'mode' => 'externo',
        'points' => 10,
        'min_seconds' => 180,
        'route' => '/juegos?juego=cien-estudiantes',
        'question' => [
            'text' => '¿Por qué algunas colonias tienen más problemas con la lluvia?',
            'options' => [
                'Porque tienen más casas pintadas de colores',
                'Por estar en zonas bajas, cerca de arroyos o en laderas',
                'Porque ahí llueve todos los días',
            ],
            'answer' => 1,
        ],
    ],
    [
        'key' => 'mochila',
        'title' => 'Arma tu mochila',
        'kind' => 'juego',
        'mode' => 'aviso',
        'points' => 20,
        'min_seconds' => 45,
        'route' => '/juegos?juego=mochila',
    ],
];
