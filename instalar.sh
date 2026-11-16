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

# Si alguna imagen todavía no se puede descargar, se sigue con la que ya está en el servidor.
docker compose -f compose.servidor.yaml pull --ignore-pull-failures || true
docker compose -f compose.servidor.yaml up -d --remove-orphans database backend frontend respaldos watchtower

# HTTPS propio con Caddy, solo si se pide con HTTPS_CADDY=1 en .env.
# Si el servidor ya tiene un proxy con HTTPS delante (como el de la facultad), no hace falta.
HTTPS_LISTO=0
if grep -q '^HTTPS_CADDY=1' .env; then
  HTTPS_LISTO=1
  docker compose -f compose.servidor.yaml --profile https up -d proxy || HTTPS_LISTO=2
fi

PUERTO=$(grep '^WEB_PORT=' .env | cut -d= -f2)
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "Listo. El sitio queda en http://${IP:-localhost}:${PUERTO:-8090}"
echo "Se actualiza solo cada vez que hay cambios en GitHub."
if [ "$HTTPS_LISTO" = 1 ]; then
  HTTP_P=$(grep '^HTTP_PORT=' .env | cut -d= -f2)
  HTTPS_P=$(grep '^HTTPS_PORT=' .env | cut -d= -f2)
  echo "También responde en los puertos ${HTTP_P:-80} y ${HTTPS_P:-443}. HTTPS se activa solo al poner el dominio en el panel de administración."
elif [ "$HTTPS_LISTO" = 2 ]; then
  echo "No se pudo abrir los puertos 80 y 443, así que Caddy no arrancó. El resto del sitio funciona igual."
fi
