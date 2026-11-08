# Cuenca Cimarrón

Base de un proyecto educativo de estudiantes UABC sobre El Niño y preparación familiar. Vue 3, Vite, Laravel 13 y PostgreSQL 16, con Docker Compose. No representa a Protección Civil ni publica alertas meteorológicas en vivo.

## Ejecutar

Requisitos: Docker Desktop con contenedores Linux y Node.js 24 (solo para inicializar las claves).

```powershell
node infra/init.mjs
docker compose up -d --build
```

Abre **http://localhost:8090**. El primer arranque instala dependencias y ejecuta migraciones automáticamente. El script de inicialización genera claves aleatorias en `.env`; no las sobrescribe si ya existen. No compartas este archivo ni lo subas a Git.

```powershell
docker compose ps
docker compose logs --tail 60 backend
docker compose stop
```

PostgreSQL persiste en el volumen `cuenca-cimarron_postgres_data`. `docker compose down` conserva los datos; la opción `-v` los elimina. Los servicios HTTP se enlazan solamente a `127.0.0.1`; PostgreSQL no publica puerto.

## Desarrollo de la interfaz

```powershell
cd frontend
npm ci
npm run dev
```

Vite abre normalmente http://localhost:5173 y redirige `/api` al backend en el puerto 8091. Mantén Docker encendido para el contador. Sin API, la interfaz muestra un estado no disponible, nunca cifras ficticias. Las fuentes están instaladas localmente: no hay dependencia de Google Fonts.

Después de cambiar código, `docker compose up -d --build` actualiza la versión del puerto 8090. Las modificaciones de Vue se ven inmediatamente en Vite. Si cambias `API_PORT` en `.env`, actualiza también el proxy de `frontend/vite.config.js`.

## Qué incluye

- Inicio con ilustración original, cuatro pasos preventivos y acceso rápido a la mochila.
- Plan familiar: doce acciones, agrupadas en cuatro pasos; ventanas accesibles e impresión de guía.
- Mochila: doce artículos, progreso persistente, reinicio con confirmación e impresión.
- Información de El Niño y enlaces a CENAPRED, NOAA y SMN.
- Identidad: colores copiables, tokens JSON/CSS, logo SVG con letras trazadas, símbolo, escudo UABC, ilustración, iconos descargables y plantilla Vue.
- Espacio de juegos explícitamente marcado como próximo. No se simulan juegos terminados.
- Contador real con visitas únicas aproximadas por navegador y sesiones, registrado en PostgreSQL.

## Organización

```text
frontend/src/views/          Pantallas
frontend/src/components/     Icon, Modal, StepCards reutilizables
frontend/src/composables/    Progreso y almacenamiento local
frontend/src/data.js         Textos, pasos, artículos y fuentes
frontend/src/icons.js        Pictogramas SVG originales
frontend/src/style.css       Diseño responsive y estilos de impresión
frontend/public/brand/       Recursos descargables y tokens
backend/app/Http/Controllers/ API de visitas y futuras sesiones de juego
backend/database/migrations/ Esquema de datos
backend/config/games.php     Juegos permitidos (vacío inicialmente)
infra/                      Inicialización y generador del logo
```

## Contador y privacidad

`POST /api/visits` recibe `visitor_id` y `session_id` como UUID. El navegador guarda el primero en localStorage y el segundo en sessionStorage. Recargar o navegar entre pantallas no suma una nueva sesión. Una pestaña o sesión nueva puede sumar otra sesión. Otro navegador, dispositivo o borrar el almacenamiento puede sumar otra visita única: **esto no es un censo de personas**.

La base guarda hashes HMAC de los identificadores y fechas, sin nombres, correos ni direcciones IP. Las restricciones únicas evitan duplicados, incluso ante solicitudes concurrentes. La API aplica un límite de solicitudes. Las métricas son orientativas y no incluyen verificación de usuarios ni protección avanzada contra bots. Nginx tiene desactivado el registro de accesos.

`GET /api/stats` devuelve `{ unique_visitors, total_visits }`. Si el navegador bloquea almacenamiento o la API falla, no se inventan datos. El avance familiar y la mochila viven únicamente en el navegador, no en el servidor.

## Agregar juegos

1. Implementar la pantalla Vue y registrar su ruta en `frontend/src/main.js`.
2. Agregar su slug a `backend/config/games.php`.
3. Al iniciar una partida, enviar `POST /api/game-sessions` con `visitor_id`, un UUID nuevo de partida en `session_id`, y `game`.

La misma combinación visitante/partida/juego es idempotente. La tabla está separada de las visitas del sitio; no hay aún resultados, cuentas ni clasificación.

## Verificación

```powershell
cd frontend
npm test
npm run build
cd ..
docker compose exec -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: -e CACHE_STORE=array backend php artisan test
node infra/smoke.mjs
```

Las pruebas de API del comando anterior usan SQLite en memoria y no modifican PostgreSQL. También pueden ejecutarse contra una base PostgreSQL de prueba independiente. `infra/smoke.mjs` verifica HTTP en el puerto local 8090: crea un visitante aleatorio, comprueba deduplicación y retira exclusivamente sus registros al terminar. No lo ejecutes contra un servicio público. Las pruebas de interfaz se ejecutan en DOM simulado, además de la compilación de producción.

Validación de esta entrega: seis pruebas de componentes aprobadas; cuatro pruebas de API (23 aserciones) aprobadas también contra una base PostgreSQL independiente; compilación de producción correcta; servicios Docker operativos y recursos descargables con respuesta HTTP 200. La base temporal se eliminó después de las pruebas. La revisión visual del sitio en navegador quedó pendiente porque la herramienta de automatización no pudo verificar la URL del navegador local; los SVG de marca e ilustración sí se renderizaron y revisaron por separado.

## Criterios de identidad

La pantalla **Identidad** es la referencia compartida. El nombre final es **Cuenca Cimarrón**. El logo del proyecto y la ilustración son SVG originales; el escudo UABC fue proporcionado por el equipo. El logo del proyecto no sustituye al escudo universitario. El PDF CERT suministrado se usó como referencia visual (verde, dorado, tipografía condensada y trazos sencillos), no como atribución institucional ni como contenido de convocatoria.

Barlow Condensed y DM Sans se distribuyen mediante Fontsource con sus licencias en los paquetes. Para regenerar el logo trazado: `python infra/build-logo.py` con `fonttools` instalado y las dependencias del frontend disponibles.

Fuentes del contenido: [CENAPRED, plan familiar](https://www1.cenapred.unam.mx/es/Publicaciones/archivos/288-INFOGRAFAPLANFAMILIARDEPROTECCINCIVIL.PDF), [CENAPRED, mochila](https://www.gob.mx/cenapred/articulos/la-seguridad-empieza-en-casa-prepara-tu-mochila-de-emergencia-228213), [NOAA, El Niño](https://www.noaa.gov/understanding-el-nino).

## Alcance de esta base

Es un entorno de desarrollo local con servidor PHP de desarrollo. Antes de publicarlo, configurar servidor PHP de producción, HTTPS, secretos y copias de seguridad; revisar contenido con el equipo académico y precisar los criterios de privacidad y retención. Las claves deben conservarse mientras se conserve la base para no romper la deduplicación de visitantes.
