# Instalación en el servidor

Esta guía es para dejar el sitio corriendo en un servidor que se actualiza solo. Cada vez que se sube un cambio a `main`, GitHub corre las pruebas, construye las imágenes y las publica en GitHub Container Registry. En el servidor, Watchtower revisa cada 5 minutos si hay imágenes nuevas y, si las hay, las descarga y reinicia el frontend y la API. La base de datos no se toca y sus datos se conservan.

## Requisitos

- Linux con Docker Engine y el plugin `docker compose`
- Acceso a internet hacia `ghcr.io` y `docker.io`
- El puerto del sitio abierto (8090 por defecto, se puede cambiar)

No hace falta git, Node ni PHP en el servidor.

## Primera instalación

1. Crear una carpeta y copiar ahí el archivo `compose.servidor.yaml` del repositorio.

2. En esa misma carpeta crear el archivo `.env` con claves nuevas:

   ```bash
   echo "APP_KEY=base64:$(openssl rand -base64 32)" > .env
   echo "DB_PASSWORD=$(openssl rand -hex 24)" >> .env
   echo "WEB_PORT=8090" >> .env
   echo "APP_URL=http://direccion-del-servidor:8090" >> .env
   chmod 600 .env
   ```

   Este archivo se queda solo en el servidor. Si se pierde, la base de datos ya no abre con la contraseña nueva, así que vale la pena guardar una copia en un lugar seguro.

3. Levantar todo:

   ```bash
   docker compose -f compose.servidor.yaml up -d
   ```

4. Revisar que esté arriba:

   ```bash
   docker compose -f compose.servidor.yaml ps
   ```

   El sitio queda en `http://direccion-del-servidor:8090`.

Después de esto no hay que hacer nada más. Los contenedores tienen `restart: unless-stopped`, así que también vuelven a levantar si el servidor se reinicia.

## Si al descargar sale "denied" o "unauthorized"

Significa que las imágenes en GitHub son privadas. Hay dos caminos:

- Hacerlas públicas desde GitHub, en el perfil del dueño del repositorio, pestaña Packages, cada paquete, Package settings, Change visibility. Es lo más sencillo.
- O iniciar sesión en el servidor con un token de GitHub que solo tenga el permiso `read:packages`:

  ```bash
  docker login ghcr.io -u HamedJason
  ```

  Y agregar al servicio `watchtower` del compose el volumen `/root/.docker/config.json:/config.json` para que también pueda descargar.

## Ajustes opcionales en `.env`

| Variable | Para qué sirve | Valor por defecto |
| --- | --- | --- |
| `WEB_PORT` | Puerto donde se publica el sitio | `8090` |
| `WEB_BIND` | Interfaz donde escucha. `127.0.0.1` si hay un proxy como Nginx o Caddy delante | `0.0.0.0` |
| `APP_URL` | Dirección pública del sitio | `http://localhost:8090` |
| `REVISAR_CADA` | Segundos entre cada revisión de Watchtower | `300` |
| `VERSION` | Fija una versión específica en lugar de la más reciente | `latest` |

## Regresar a una versión anterior

Cada imagen se publica también con el identificador del commit. Si una actualización sale mal, se puede fijar la versión anterior:

1. Buscar el commit bueno en GitHub (por ejemplo `fbcd023...`, el identificador completo)
2. Agregar `VERSION=identificador-completo` al `.env`
3. `docker compose -f compose.servidor.yaml up -d`

Mientras `VERSION` esté fijada, Watchtower no cambia nada. Para volver a recibir actualizaciones se borra esa línea y se repite el paso 3.

## Respaldo de la base de datos

La API aplica las migraciones sola cada vez que arranca. Conviene sacar un respaldo de vez en cuando:

```bash
docker compose -f compose.servidor.yaml exec -T database pg_dump -U cuenca cuenca > respaldo-$(date +%F).sql
```

## Comandos útiles

```bash
# Ver registros de la API
docker compose -f compose.servidor.yaml logs -f backend

# Ver qué ha actualizado Watchtower
docker compose -f compose.servidor.yaml logs watchtower

# Forzar la actualización sin esperar
docker compose -f compose.servidor.yaml pull
docker compose -f compose.servidor.yaml up -d
```
