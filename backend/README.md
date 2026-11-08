# Backend de Cuenca Cimarrona

API en Laravel que guarda el contador de visitas del sitio en PostgreSQL.

- `POST /api/visits` registra una visita con `visitor_id` y `session_id`
- `GET /api/stats` devuelve las visitas únicas y el total de sesiones

Se levanta junto con todo el proyecto con `docker compose up -d --build`. Las instrucciones completas están en el README de la raíz.
