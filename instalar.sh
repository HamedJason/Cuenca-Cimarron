#!/bin/sh
# Instala el sitio en el servidor y deja la actualización automática encendida.
# Uso: sh instalar.sh
set -e
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Se necesita Docker con el plugin docker compose instalado."
  exit 1
fi

if [ -f .env ]; then
  echo "Ya existe .env, se conservan las claves y los datos."
else
  aleatorio() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }
  {
    echo "APP_KEY=base64:$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
    echo "DB_PASSWORD=$(aleatorio 24)"
    echo "WEB_PORT=8090"
  } > .env
  chmod 600 .env
  echo "Se creó .env con claves nuevas. Guarda una copia en un lugar seguro."
fi

docker compose -f compose.servidor.yaml pull
docker compose -f compose.servidor.yaml up -d

PUERTO=$(grep '^WEB_PORT=' .env | cut -d= -f2)
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "Listo. El sitio queda en http://${IP:-localhost}:${PUERTO:-8090}"
echo "Se actualiza solo cada vez que hay cambios en GitHub."
