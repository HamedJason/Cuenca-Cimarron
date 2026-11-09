# Cuenca Cimarrona

Proyecto académico de prevención y preparación ante lluvias y El Niño en Tijuana. Se organiza con una aplicación web en Vue/Vite y una API en Laravel.

## Servidor con actualización automática

Para el servidor no se usan los comandos de "Ejecutar el proyecto completo". Cada cambio en `main` publica imágenes nuevas en GitHub y el servidor las toma solo con Watchtower, sin `git pull` ni compilar nada. Solo se instala una vez, con un comando:

```bash
git clone https://github.com/HamedJason/Cuenca-Cimarron.git && sh Cuenca-Cimarron/instalar.sh
```

El sitio queda en el puerto 8090. Para usar otro, se agrega al final, por ejemplo `sh Cuenca-Cimarron/instalar.sh 8080`. También sirve para cambiar el puerto después, volviendo a correr el script dentro de la carpeta.

El detalle, los ajustes opcionales y cómo regresar a una versión anterior están en `docs/servidor.md`.

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

El sitio queda en `http://localhost:8090`; la API utiliza el puerto `8091`. El archivo `.env` se genera localmente y no se debe subir al repositorio.
## Tecnologías

- **Frontend:** Vue 3, Vue Router y Vite.
- **Backend:** Laravel y PostgreSQL.
- **Interfaz adicional:** páginas estáticas de dinámicas, información y consejos en `frontend/public/pages/`.

Consulte `docs/` para la investigación y los criterios visuales del proyecto.
