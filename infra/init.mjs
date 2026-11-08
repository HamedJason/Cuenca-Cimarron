import { randomBytes } from 'node:crypto'
import { writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const path = fileURLToPath(new URL('../.env', import.meta.url))
if (existsSync(path)) { console.log('.env ya existe; se conservan las claves y los datos.') }
else {
 writeFileSync(path, `APP_KEY=base64:${randomBytes(32).toString('base64')}\nDB_PASSWORD=${randomBytes(24).toString('hex')}\nWEB_PORT=8090\nAPI_PORT=8091\n`, { mode: 0o600 })
 console.log('.env creado con claves aleatorias. Ya puedes ejecutar docker compose up -d --build.')
}
