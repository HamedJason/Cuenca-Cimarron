# Cuenca Cimarrón

Sitio para familias de Tijuana sobre qué hacer durante la temporada de El Niño. Lo hicimos estudiantes de la UABC.

No es un sitio oficial de Protección Civil y no publica alertas en vivo. Los números y avisos enlazan a las fuentes oficiales.

## Qué tiene

- **Emergencias:** el 911, los teléfonos de Protección Civil, Bomberos y denuncia anónima, los refugios temporales con ruta en Google Maps y el mapa de riesgo del municipio
- **El Niño:** qué es, qué cambia en el Pacífico y qué se espera en Tijuana
- **Plan familiar:** cuatro pasos con sus acciones. El avance se guarda en el navegador y se puede imprimir
- **Mochila:** doce cosas para tener listas, con lista para marcar e imprimir
- **Estilos:** colores, letras e iconos del proyecto. Se abre desde el pie de página

## Cómo correrlo

Necesitas Docker Desktop y Node.js 24.

```powershell
node infra/init.mjs
docker compose up -d --build
```

Luego abre http://localhost:8090

`init.mjs` crea el archivo `.env` con claves al azar. Ese archivo no se sube a Git.

Cada vez que cambies código, vuelve a correr `docker compose up -d --build` para ver los cambios en el 8090.

## Trabajar en la interfaz

```powershell
cd frontend
npm ci
npm run dev
```

Se abre en http://localhost:5173 y los cambios se ven al instante. Para que funcione el contador de visitas, Docker tiene que estar encendido.

## Dónde está cada cosa

```text
frontend/src/views/          Las páginas
frontend/src/components/     Piezas que se repiten (iconos, ventanas, escenas animadas)
frontend/src/data.js         Textos, teléfonos, refugios, pasos y artículos
frontend/src/style.css       Todos los estilos
frontend/public/brand/       Logo, escudo y variables de color
backend/                     API en Laravel para el contador de visitas
docs/                        Investigación sobre Tijuana y guía de estilos
infra/                       Scripts para preparar y probar el proyecto
```

Las reglas de diseño están en `docs/estilos.md`.

## Contador de visitas

El navegador guarda un identificador al azar para no contar cada recarga como una persona nueva. No se guardan nombres, correos ni direcciones IP. Si alguien entra desde otro navegador o borra sus datos, cuenta como otra visita, así que el número es aproximado.

El plan familiar y la mochila solo se guardan en el navegador de cada persona, nunca en el servidor.

## Pruebas

```powershell
cd frontend
npm test
npm run build
```

Para probar la API:

```powershell
docker compose exec -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: -e CACHE_STORE=array backend php artisan test
```

## Antes de publicarlo

Ahora corre como entorno de desarrollo. Para ponerlo en internet falta configurar HTTPS, un servidor PHP de producción y copias de seguridad de la base de datos. También conviene que el equipo revise el contenido antes.

## Fuentes

- [CENAPRED, plan familiar](https://www1.cenapred.unam.mx/es/Publicaciones/archivos/288-INFOGRAFAPLANFAMILIARDEPROTECCINCIVIL.PDF)
- [CENAPRED, mochila de emergencia](https://www.gob.mx/cenapred/articulos/la-seguridad-empieza-en-casa-prepara-tu-mochila-de-emergencia-228213)
- [NOAA, El Niño](https://www.noaa.gov/understanding-el-nino)
- Investigación de Tijuana en `docs/investigacion-tijuana.md`
