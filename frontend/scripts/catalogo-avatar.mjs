// Exporta lo que la API necesita del kit de avatares para validar las compras de los alumnos:
// precios, piezas iniciales, kits, premios, retos y el secreto.
// Se corre después de cambiar art.js, economy.js o rewards.js:
//   cd frontend && node scripts/catalogo-avatar.mjs
// La prueba tests/cimacoins.test.js falla si el archivo quedó viejo.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "../src/avatar/catalog-export.js";

const target = fileURLToPath(new URL("../../backend/config/avatar-catalogo.json", import.meta.url));
writeFileSync(target, JSON.stringify(buildCatalog(), null, 1) + "\n");
console.log(`Catálogo escrito en ${target}`);
