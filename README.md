# Cuenca Cimarrona

Proyecto académico de prevención y preparación ante lluvias y El Niño en Tijuana. Se organiza con una aplicación web en Vue/Vite y una API en Laravel.

## Servidor con actualización automática

Para el servidor no se usan los comandos de "Ejecutar el proyecto completo". Cada cambio en `main` publica imágenes nuevas en GitHub y el servidor las toma solo con Watchtower, sin `git pull` ni compilar nada.

### Primera instalación

```bash
git clone https://github.com/HamedJason/Cuenca-Cimarron.git && sh Cuenca-Cimarron/instalar.sh
```

El sitio queda en el puerto 8090. Para usar otro, se agrega al final, por ejemplo `sh Cuenca-Cimarron/instalar.sh 8080`.

### Actualizar un servidor que ya tiene el sitio

No hace falta para recibir cambios del sitio, esos llegan solos. Es opcional y solo agrega el respaldo diario guardado en el servidor, que también se puede tener con el respaldo automático en GitHub. Se corre desde la misma carpeta donde se instaló la primera vez, la que contiene `Cuenca-Cimarron`. Las claves y los datos se conservan.

```bash
git -C Cuenca-Cimarron pull
```

```bash
sh Cuenca-Cimarron/instalar.sh
```

Para revisar que quedó, este comando debe responder con `"database":true`:

```bash
curl http://localhost:8090/api/version
```

Si algún comando dice que no tiene permiso para usar Docker, se repite con `sudo` al principio.

### HTTPS

El servidor de la facultad ya tiene HTTPS con un proxy propio delante del puerto 8090, así que no hay que hacer nada más.

Si algún día se instala en un servidor sin HTTPS, el sitio trae Caddy, que saca el certificado solo. Se activa agregando `HTTPS_CADDY=1` al `.env` y volviendo a correr `sh Cuenca-Cimarron/instalar.sh`. Después se escribe el dominio en el panel de administración.

El detalle, los ajustes opcionales y cómo regresar a una versión anterior están en `docs/servidor.md`. Cómo funcionan las cuentas de escuelas, docentes, alumnos y administración está en `docs/cuentas.md`.

## Integración de interfaces

Esta versión combina elementos de la interfaz desarrollada por Hamed en [Cuenca-Cimarron](https://github.com/HamedJason/Cuenca-Cimarron) con la interfaz que trabajamos en la rama `hambu`. La integración busca mejorar la experiencia actual: mantener a la mano la información de emergencia, ordenar la navegación y reunir Juegos, Información y Consejos bajo un estilo visual consistente. También conserva los apartados de El Niño, Plan familiar y Mochila de emergencia.

## Estructura

```text
frontend/
  src/            Aplicación Vue: vistas, componentes y datos
  public/         Recursos del sitio y páginas de Juegos, Información y Consejos
  package.json    Dependencias y comandos de desarrollo
backend/
  app/            API Laravel y controladores
  routes/         Rutas HTTP
  database/       Migraciones
docs/             Investigación y decisiones del proyecto
infra/            Inicialización del entorno local
compose.yaml      Frontend, API y PostgreSQL
```

Los archivos de la raíz (`index.html`, `assets/`, `css/`, `js/` y `pages/`) se conservan como paquete de vista previa para abrir el estado integrado actual. Para desarrollar la aplicación modular, trabaje desde `frontend/` y `backend/`.

## Ejecutar el frontend

```powershell
cd frontend
npm ci
npm run dev
```

Vite abre la aplicación en `http://127.0.0.1:5173`. Para compilar:

```powershell
npm run build
```

## Ejecutar el proyecto completo

Se requiere Docker Desktop y Node.js. Desde la raíz:

```powershell
node infra/init.mjs
docker compose up -d --build
```

El sitio queda en `http://localhost:8090` y la API utiliza el puerto `8091`. El archivo `.env` se genera localmente y no se debe subir al repositorio.
## Tecnologías

- **Frontend:** Vue 3, Vue Router y Vite.
- **Backend:** Laravel y PostgreSQL.
- **Interfaz adicional:** páginas estáticas de dinámicas, información y consejos en `frontend/public/pages/`.

Consulte `docs/` para la investigación y los criterios visuales del proyecto.
