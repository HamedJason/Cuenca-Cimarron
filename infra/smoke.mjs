// Verifies the complete local Nginx -> Laravel -> PostgreSQL path.
// Cleans up only its own randomly generated visitor and cascading sessions.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { cleanupSmokeVisitor } from './cleanup-smoke.mjs'
const base = 'http://localhost:8090'
const visitor = randomUUID(), session = randomUUID()
const stats = async () => {
 const response = await fetch(`${base}/api/stats`)
 assert.equal(response.status, 200)
 return response.json()
}
const visit = async sessionId => {
 const response = await fetch(`${base}/api/visits`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ visitor_id: visitor, session_id: sessionId }) })
 assert.equal(response.status, 200)
 return response.json()
}
const before = await stats()
try {
 const first = await visit(session)
 assert.equal(first.unique_visitors, before.unique_visitors + 1)
 assert.equal(first.total_visits, before.total_visits + 1)
 assert.deepEqual(await visit(session), first)
 const next = await visit(randomUUID())
 assert.equal(next.unique_visitors, first.unique_visitors)
 assert.equal(next.total_visits, first.total_visits + 1)
 for (const path of ['/', '/brand/cuenca-logo.svg', '/brand/cimarron.svg', '/brand/cuenca-paisaje.svg', '/brand/uabc-escudo.png', '/brand/tokens.css', '/brand/plantilla-vista.vue']) {
  assert.equal((await fetch(`${base}${path}`)).status, 200, path)
 }
 console.log('HTTP: página, recursos, contador y deduplicación correctos.')
} finally {
 cleanupSmokeVisitor(visitor)
 console.log('Retirados exclusivamente los registros temporales de esta prueba.')
}
assert.deepEqual(await stats(), before)
