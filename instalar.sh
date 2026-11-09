#!/bin/sh
# Instala el sitio en el servidor y deja la actualización automática encendida.
# Uso: sh instalar.sh [puerto]
# Sin puerto se usa 8090. Ejemplo: sh instalar.sh 8080
set -e
cd "$(dirname "$0")"

PUERTO_PEDIDO="$1"
if [ -n "$PUERTO_PEDIDO" ]; then
  case "$PUERTO_PEDIDO" in
    *[!0-9]*) echo "El puerto debe ser un número, por ejemplo: sh instalar.sh 8080"; exit 1 ;;
  esac
  if [ "$PUERTO_PEDIDO" -lt 1 ] || [ "$PUERTO_PEDIDO" -gt 65535 ]; then
    echo "El puerto debe estar entre 1 y 65535."
    exit 1
  fi
fi

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
    echo "WEB_PORT=${PUERTO_PEDIDO:-8090}"
  } > .env
  chmod 600 .env
  echo "Se creó .env con claves nuevas. Guarda una copia en un lugar seguro."
fi

if [ -n "$PUERTO_PEDIDO" ]; then
  if grep -q '^WEB_PORT=' .env; then
    sed -i "s/^WEB_PORT=.*/WEB_PORT=$PUERTO_PEDIDO/" .env
  else
    echo "WEB_PORT=$PUERTO_PEDIDO" >> .env
  fi
  echo "El sitio se publicará en el puerto $PUERTO_PEDIDO."
fi

docker compose -f compose.servidor.yaml pull
docker compose -f compose.servidor.yaml up -d

PUERTO=$(grep '^WEB_PORT=' .env | cut -d= -f2)
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "Listo. El sitio queda en http://${IP:-localhost}:${PUERTO:-8090}"
echo "Se actualiza solo cada vez que hay cambios en GitHub."
