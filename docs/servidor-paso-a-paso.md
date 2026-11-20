# Servidor paso a paso

Comandos para copiar y pegar en el servidor (VPS) de la facultad. La explicación completa está en `docs/servidor.md`.

El sitio vive en la carpeta `Cuenca-Cimarron` del usuario. Todos los comandos se corren desde ahí:

```bash
cd ~/Cuenca-Cimarron
```

## 1. Llevar el código al servidor

### Opción A: desde GitHub (cuando el código ya está en `main`)

GitHub construye las imágenes en cada cambio a `main` y Watchtower las instala solo en unos 5 minutos. Para forzarlo de inmediato:

```bash
git pull
docker compose -f compose.servidor.yaml pull
docker compose -f compose.servidor.yaml up -d --remove-orphans
```

Primera vez en un servidor nuevo:

```bash
git clone https://github.com/HamedJason/Cuenca-Cimarron.git && sh Cuenca-Cimarron/instalar.sh
```

### Opción B: copiar la carpeta (si el código todavía no está en `main`)

Desde la computadora que tiene el código, en la carpeta del repositorio (con Git Bash en Windows), se empaca solo lo que va en el repositorio. Así no van `node_modules`, `dist`, `vendor`, el `.env` de la computadora ni otros archivos ignorados:

```bash
{ git ls-files -co --exclude-standard -z -- frontend backend; printf 'compose.servidor.yaml\0compose.construir.yaml\0instalar.sh\0'; } | tar --null -T - -czf cuenca.tgz
```

Pesa unos 60 MB.

Se copia al servidor (cambia `usuario` y `servidor`):

```bash
scp cuenca.tgz usuario@servidor:~/Cuenca-Cimarron/
```

En el servidor se desempaca. El `.env` no viene en el paquete, así que se conserva:

```bash
tar -xzf cuenca.tgz && rm cuenca.tgz
```

Y se construyen las imágenes ahí mismo:

```bash
docker compose -f compose.servidor.yaml -f compose.construir.yaml up -d --build database backend frontend respaldos
```

Con `compose.construir.yaml` Watchtower no toca esos contenedores. Cuando el código ya esté en `main`, se regresa a la opción A con:

```bash
docker compose -f compose.servidor.yaml up -d --remove-orphans
```

En todos los comandos de abajo, si usas la opción B agrega `-f compose.construir.yaml` después de `-f compose.servidor.yaml`.

## 2. Archivo `.env`

Va en la misma carpeta y nunca se sube a GitHub. `instalar.sh` lo crea solo con claves nuevas. Si se hace a mano:

```bash
echo "APP_KEY=base64:$(openssl rand -base64 32)" > .env
echo "DB_PASSWORD=$(openssl rand -hex 24)" >> .env
echo "WEB_PORT=8090" >> .env
echo "APP_URL=https://cuencacimarrona.software-fcqi.com" >> .env
chmod 600 .env
```

| Variable | Qué es |
| --- | --- |
| `APP_KEY` | Llave de cifrado. No se cambia nunca o se pierden las sesiones y los códigos |
| `DB_PASSWORD` | Contraseña de la base. No se cambia después de crearla |
| `WEB_PORT` | Puerto del sitio. La facultad ya tiene su proxy con HTTPS delante del 8090 |
| `APP_URL` | Dirección pública del sitio |
| `HTTPS_CADDY` y `DOMINIO` | Solo si el servidor no tiene HTTPS propio (ver abajo) |

Guarda una copia del `.env` en un lugar seguro.

## 3. Levantar el sitio

```bash
docker compose -f compose.servidor.yaml up -d --remove-orphans
docker compose -f compose.servidor.yaml ps
```

Cada vez que arranca el backend corren solos las migraciones de la base, el catálogo de actividades y el catálogo de escuelas de Tijuana y Rosarito (2,352 escuelas de la SEP). El archivo de escuelas va dentro de la imagen (`backend/database/data`), así que llega con Watchtower sin tocar nada en el servidor. Se carga si la tabla está vacía o si el archivo cambió. Solo agrega o actualiza escuelas del catálogo: no borra nada ni toca las escuelas registradas, y reiniciar no duplica nada. Si hiciera falta correrlos a mano (el último fuerza la carga del catálogo):

```bash
docker compose -f compose.servidor.yaml exec backend php artisan migrate --force
docker compose -f compose.servidor.yaml exec backend php artisan actividades:sincronizar
docker compose -f compose.servidor.yaml exec backend php artisan escuelas:catalogo
```

Para revisar que el buscador de "Registra tu escuela" encuentra escuelas:

```bash
curl -s "http://localhost:8090/api/catalogo-escuelas?q=forjadores%20baja"
```

Debe regresar escuelas. Si dice `{"schools":[]}`, corre `php artisan escuelas:catalogo` como arriba.

## Lo que llega solo

Con la opción A, al hacer merge a `main` GitHub construye las imágenes y Watchtower las instala en unos 5 minutos. Eso basta para todo: el 911, el Directorio, los juegos, la ubicación por zona, el panel de visitas, el catálogo de escuelas, el registro sin revisión y el modo demostración. Las migraciones nuevas corren solas al arrancar. No hay que entrar al servidor ni cambiar `compose.servidor.yaml` ni `.env`.

`compose.construir.yaml` solo se usa en la opción B.

## 4. Crear el super admin

Solo la primera vez. Entra a `https://cuencacimarrona.software-fcqi.com/configurar` y escribe la clave de instalación (la tiene Jason), un nombre, un correo y una contraseña. Guarda los códigos de recuperación que te da.

## 5. Demo de la exposición

Se enciende y se apaga desde el panel, sin comandos: `/admin`, pestaña Sistema, "Modo demostración". Se apaga sola a las 24 horas. Los detalles y el guion están en `docs/demo-20nov.md`.

## 6. Ver que todo esté bien

```bash
curl -s http://localhost:8090/api/version
docker compose -f compose.servidor.yaml ps
```

`/api/version` debe decir `"database":true`.

Ver los mensajes del backend (Ctrl+C para salir):

```bash
docker compose -f compose.servidor.yaml logs -f --tail=100 backend
```

Del frontend:

```bash
docker compose -f compose.servidor.yaml logs -f --tail=100 frontend
```

## 7. Reiniciar

Todo:

```bash
docker compose -f compose.servidor.yaml restart
```

Solo el backend:

```bash
docker compose -f compose.servidor.yaml restart backend
```

Si un cambio en `.env` no se nota, `restart` no basta. Hay que recrear el contenedor:

```bash
docker compose -f compose.servidor.yaml up -d
```

## 8. HTTPS con otro dominio

Hoy la facultad pone el HTTPS de `cuencacimarrona.software-fcqi.com` con su propio proxy. Si el sitio se mueve a otro dominio sin certificado (por ejemplo `cuencacimarrona.tij.uabc.mx`), el compose trae Caddy, que pide el certificado solo:

1. El dominio debe apuntar a la IP del servidor y los puertos 80 y 443 deben estar abiertos
2. Agregar al `.env`:

   ```bash
   echo "HTTPS_CADDY=1" >> .env
   echo "DOMINIO=cuencacimarrona.tij.uabc.mx" >> .env
   echo "APP_URL=https://cuencacimarrona.tij.uabc.mx" >> .env
   ```

3. Volver a correr la instalación:

   ```bash
   sh instalar.sh
   ```

Caddy pide el certificado a Let's Encrypt la primera vez que alguien entra con ese dominio. Si los puertos 80 y 443 ya los usa otro programa, Caddy no arranca y el sitio sigue en el puerto 8090.

## Probado

El 20 de noviembre de 2026 se probó como lo hará el servidor: se construyeron las imágenes igual que en GitHub (mismo Dockerfile y carpeta) y se levantaron con el `compose.servidor.yaml` que está hoy en `main`, sin cambios y con la base vacía. El catálogo de escuelas se cargó solo (2,352), el buscador encontró "forjadores", "forjadores baja california" y el CCT 02EPR0409H, se registró una escuela de prueba y al reiniciar el backend no se duplicó nada.

Antes de eso se levantó `compose.servidor.yaml` con `compose.construir.yaml` desde cero en una computadora, con otro nombre de proyecto y la base vacía. Las migraciones y el catálogo de escuelas (2,352) se cargaron solos, `/api/version` respondió bien, el buscador encontró "forjadores de baja california", se registró una escuela de prueba, el seeder de la demo creó todo, `demo:borrar` lo quitó y con `DEMO_20NOV=false` la demo respondió 404.
