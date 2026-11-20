# Demo de la exposición del 20 de noviembre

La página `/testeo_20nov` entra a cuentas de ejemplo (super admin, escuela, profesor y alumno) con el mismo inicio de sesión que usa el sitio de verdad. Todo lo demo lleva "Demo" en el nombre y sus cuentas usan el dominio reservado `demo-20nov.invalid`, así que se borra sin tocar nada real.

## Encenderla

Desde el panel, sin entrar al servidor:

1. Entra a `/admin` con tu cuenta de administración
2. Pestaña **Sistema**, sección **Mantenimiento**, **Modo demostración**
3. Escribe ENCENDER y presiona "Encender modo demostración"

Se crean los datos demo y se abre `https://cuencacimarrona.software-fcqi.com/testeo_20nov`. El panel dice a qué hora se apaga sola.

## Apagarla

En el mismo lugar escribe APAGAR y presiona "Apagar y borrar lo demo". Se borra todo lo demo y `/testeo_20nov` vuelve a decir "Esta página no existe".

Si se olvida, **se apaga sola a las 24 horas** y borra todo lo demo.

## Seguridad

`/testeo_20nov` deja entrar a las cuentas demo sin contraseña, por eso:

- La cuenta "Admin Demo" solo ve y cambia las escuelas demo. No ve escuelas reales, cuentas, bitácora ni respaldos, no cambia la dirección del sitio ni apaga la demo
- Las cuentas demo de escuela, profesor y alumno solo ven sus propios datos demo
- Todo lo demo usa el dominio reservado `demo-20nov.invalid` y se borra completo al apagar

Para pruebas en una computadora, `DEMO_20NOV=true` en el entorno del backend la deja encendida a la fuerza. En el servidor no hace falta.

## Qué crea

- Admin Demo (super admin)
- Primaria Demo Cuenca Cimarrona y Secundaria Demo Cuenca Cimarrona, las dos registradas
- Profe Demo con dos grupos: 4° A Demo y 5° B Demo
- Seis alumnos (Ana Demo, Beto Demo, Carla Demo, Dani Demo, Eli Demo y Fer Demo) con actividades completadas, Cimacoins ganadas distintas para que el ranking tenga lugares claros y piezas compradas para su cimarrón
- 77 visitas por zona para el panel "¿Desde dónde nos visitan?". Al borrar la demo se restan y las visitas reales se quedan

## Guion sugerido (unos 10 minutos)

| Paso | Qué mostrar | Qué decir |
| --- | --- | --- |
| 1 | Inicio | El 911 y los números van primero porque en una emergencia es lo que sirve |
| 2 | Aviso "¿De qué parte de Baja California nos visitas?" | Solo guardamos la zona aproximada, nunca la ubicación exacta |
| 3 | Atajo "Ver el nuevo 911" | Una profesional del 911 nos dijo qué enseñar: cada paso tiene su animación |
| 4 | Juego "¿Es una emergencia?" y "Aprende tu dirección" | Los niños practican cuándo sí llamar y cómo decir dónde viven |
| 5 | Atajo "Ver el Directorio" | Todos los números en un lugar, con el botón morado del Escuadrón Violeta |
| 6 | Atajo "Juegos nuevos" | Hay juegos hechos por otros equipos de la UABC |
| 7 | Entrar como escuela | La escuela se registra sola y de inmediato da de alta a sus docentes |
| 8 | Entrar como super admin | Vemos las escuelas, las cifras y desde dónde nos visitan |
| 9 | Entrar como profesor | El profesor crea grupos con código y ve el avance de cada alumno |
| 9b | En el grupo 4° A Demo, el Ranking del grupo | Cada actividad da Cimacoins y el profe ve quién participa más con un podio |
| 10 | Atajo "Unirse a un grupo con código" | Un alumno entra solo con el código y su nombre, sin correo |
| 11 | Entrar como alumno y "Ver personajes del cimarrón" | Un solo número para el niño: las Cimacoins que gana aprendiendo y gasta en su cimarrón |
| 12 | Cerrar sesión y volver a la demo | Así se regresa al inicio de la demo |

## Si algo falla

- El buscador de "Registra tu escuela" no encuentra nada: el catálogo se carga solo al arrancar el backend. Si aun así está vacío, alguien con acceso al servidor corre `docker compose -f compose.servidor.yaml exec backend php artisan escuelas:catalogo`. Prueba con "forjadores de baja california", hay dos primarias con ese nombre

- "Faltan los datos demo": en el panel apaga y vuelve a encender el modo demostración
- Un botón no responde: "Cerrar sesión y volver a la demo" y prueba de nuevo
- La página dice "Esta página no existe": el modo demostración está apagado o ya pasaron las 24 horas. Enciéndelo en el panel
