# Instalación en el servidor

Esta guía es para dejar el sitio corriendo en un servidor que se actualiza solo. Cada vez que se sube un cambio a `main`, GitHub corre las pruebas, construye las imágenes y las publica en GitHub Container Registry. En el servidor, Watchtower revisa cada 5 minutos si hay imágenes nuevas y, si las hay, las descarga y reinicia el frontend y la API. La base de datos no se toca y sus datos se conservan.

Watchtower solo cambia imágenes. Si cambia `compose.servidor.yaml` (un servicio nuevo, un puerto, una variable), hay que volver a correr el comando de instalación una vez para tenerlo. Las escuelas, los puntos y las sesiones en la base llegan con las imágenes, así que funcionan aunque el servidor siga con el compose de la primera instalación.

## Requisitos

- Linux con Docker Engine y el plugin `docker compose`
- Acceso a internet hacia `ghcr.io` y `docker.io`
- El puerto del sitio abierto (8090 por defecto, se puede cambiar)

No hace falta git, Node ni PHP en el servidor.

## Primera instalación

La forma corta es un solo comando, que descarga el repositorio, crea el `.env` con claves nuevas y levanta todo:

```bash
git clone https://github.com/HamedJason/Cuenca-Cimarron.git && sh Cuenca-Cimarron/instalar.sh
```

Si el sitio ya estaba instalado, se actualiza con `git -C Cuenca-Cimarron pull` y luego `sh Cuenca-Cimarron/instalar.sh`, desde la misma carpeta. El `.env` y la base de datos se conservan.

Por defecto usa el puerto 8090. Para otro puerto se pone como argumento, por ejemplo `sh Cuenca-Cimarron/instalar.sh 8080`.

Si se prefiere hacerlo a mano, estos son los mismos pasos que hace `instalar.sh`:

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
   docker compose -f compose.servidor.yaml up -d --remove-orphans
   ```

4. Revisar que esté arriba:

   ```bash
   docker compose -f compose.servidor.yaml ps
   ```

   El sitio queda en `http://direccion-del-servidor:8090`.

Después de esto no hay que hacer nada más. Los contenedores tienen `restart: unless-stopped`, así que también vuelven a levantar si el servidor se reinicia.

## HTTPS

En el servidor de la facultad el HTTPS lo pone un proxy que ya existe delante del puerto 8090 (https://cuencacimarrona.software-fcqi.com). El sitio no necesita nada más.

Para un servidor sin HTTPS, el compose trae el servicio `proxy` (Caddy), apagado por defecto. Para encenderlo:

1. Agregar `HTTPS_CADDY=1` al `.env`.
2. Volver a correr `sh Cuenca-Cimarron/instalar.sh`.
3. Escribir el dominio en el panel de administración (Ajustes, Dominio) o en `DOMINIO` dentro de `.env`.

Caddy escucha en los puertos 80 y 443 y pide el certificado a Let's Encrypt la primera vez que alguien entra con ese dominio. Solo lo pide para el dominio aprobado. El dominio debe apuntar al servidor y los puertos deben estar abiertos desde internet.

La dirección que usan los enlaces que da el sitio (grupos, docentes, invitaciones) se guarda sola al crear la cuenta de administración, con la dirección desde la que se configuró. Se puede cambiar en el panel (Ajustes, Dirección pública).

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
| `HTTPS_CADDY` | `1` para encender Caddy con HTTPS propio | vacío |
| `DOMINIO` | Dominio para el HTTPS de Caddy. Se puede poner aquí o desde el panel | vacío |
| `HTTP_PORT` | Puerto HTTP de Caddy | `80` |
| `HTTPS_PORT` | Puerto HTTPS de Caddy | `443` |
| `REVISAR_CADA` | Segundos entre cada revisión de Watchtower | `300` |
| `VERSION` | Fija una versión específica en lugar de la más reciente | `latest` |

## Regresar a una versión anterior

Cada imagen se publica también con el identificador del commit. Si una actualización sale mal, se puede fijar la versión anterior:

1. Buscar el commit bueno en GitHub (por ejemplo `fbcd023...`, el identificador completo)
2. Agregar `VERSION=identificador-completo` al `.env`
3. `docker compose -f compose.servidor.yaml up -d`

Mientras `VERSION` esté fijada, Watchtower no cambia nada. Para volver a recibir actualizaciones se borra esa línea y se repite el paso 3.

## Primera cuenta de administración

Después de instalar, se entra a `http://direccion-del-servidor:8090/configurar` y se llena la clave de instalación, un nombre, un correo y una contraseña. Solo funciona mientras no exista ninguna cuenta de administración. La clave la tiene el equipo y en el repositorio solo está su huella.

Desde el panel de administración (`/admin`) se aprueban escuelas, se escribe la dirección pública y se descargan respaldos. Nada de eso necesita entrar al servidor.

## Contraseñas sin correo

El sitio no manda correos. Cada cuenta (escuela o administración) recibe 10 códigos de recuperación al crearse, con un aviso que no deja seguir hasta descargarlos, imprimirlos o copiarlos. Si alguien olvida su contraseña, entra a "Olvidé mi contraseña" y pone su correo, un código y la contraseña nueva. Cada código sirve una vez y desde su cuenta puede generar códigos nuevos.

Si una escuela pierde la contraseña y también los códigos, en el panel de administración, en el detalle de la escuela, hay un enlace para que ponga contraseña nueva y un botón para generarle códigos nuevos. Se los entregan por otro medio, por ejemplo WhatsApp. Si un docente pierde su enlace, su escuela le genera otro desde su cuenta, y a los alumnos los atiende su docente.

## Cuentas del equipo

En el panel, pestaña Cuentas, se invita a más personas. Hay dos tipos:

- **Solo ver datos:** ve el panel de datos y la lista de escuelas. No puede aprobar escuelas, cambiar ajustes, descargar respaldos ni invitar a nadie.
- **Administración completa:** puede hacer todo.

El panel da un enlace para mandárselo por WhatsApp. Con él pone su contraseña y recibe sus códigos de recuperación. Siempre queda al menos una cuenta de administración.

## Panel de sistema

La cuenta de administración tiene, además de lo de las escuelas y el panel de datos:

- **Sistema:** revisa que la base, los respaldos, la dirección pública y el catálogo estén bien, y muestra cuánto hay en la base. Tiene botones para hacer limpieza y para cerrar un ciclo escolar (archiva todos los grupos de ese ciclo).
- **Bitácora:** quién hizo qué y cuándo (aprobar, suspender, dar de alta docentes, cambiar ajustes, descargar respaldos).
- **Detalle de cada escuela:** sus docentes y grupos, un enlace nuevo para un docente que perdió el suyo, un enlace para que la escuela ponga contraseña nueva, códigos de recuperación nuevos, cambiar su correo y suspenderla. Mientras una escuela está suspendida, sus docentes y alumnos no pueden entrar. No se borra nada y se puede reactivar.

## Catálogo de escuelas

Para que cada escuela se busque y se elija al registrarse, en el panel de administración (pestaña Escuelas) está el botón "Cargar desde datos.gob.mx". Trae las escuelas de Tijuana y Playas de Rosarito del Catálogo de Centros de Trabajo de la SEP y las guarda en la base. Conviene actualizarlo una vez al año. Para usar el catálogo de otro año se cambia `SEP_CATALOG` en `frontend/src/composables/useCatalog.js`.

## Respaldo de la base de datos

El servicio `respaldos` saca una copia de la base cada día y guarda las de las últimas dos semanas en el volumen `respaldos`. Se descargan desde el panel de administración, en la pestaña Respaldos, donde también hay un botón para sacar una copia en ese momento.

Si el servidor se ve desde internet, GitHub puede guardar además una copia cifrada cada día durante 14 días (workflow `respaldo-diario.yml`). Para activarlo, en el repositorio se agregan la variable `SITIO_URL` y los secretos `RESPALDO_CLAVE` (se genera en el panel) y `RESPALDO_CIFRADO` (una frase larga que solo conoce el equipo). Para abrir un respaldo descargado de GitHub:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in cuenca-AAAA-MM-DD.sql.gz.enc -out respaldo.sql.gz
```

Para restaurar un respaldo en una base vacía:

```bash
gunzip -c respaldo.sql.gz | docker compose -f compose.servidor.yaml exec -T database psql -U cuenca cuenca
```

## Comandos útiles

```bash
# Ver registros de la API
docker compose -f compose.servidor.yaml logs -f backend

# Ver qué ha actualizado Watchtower
docker compose -f compose.servidor.yaml logs watchtower

# Forzar la actualización sin esperar
docker compose -f compose.servidor.yaml pull
docker compose -f compose.servidor.yaml up -d --remove-orphans

# Ver qué versión corre
curl http://localhost:8090/api/version
```
