// Premios de Cimacoins del sitio. Archivo sin Vue ni arte para que lo usen el sitio,
// la tienda y el script que exporta el catálogo para la API (scripts/catalogo-avatar.mjs).

// Monedas con las que empieza toda cartera nueva (visitante o alumno).
export const STARTER_COINS = 150;
// Alumnos con sesión: cada punto de una actividad también da estas Cimacoins.
// Los puntos nunca se gastan; las Cimacoins sí.
export const COINS_PER_POINT = 10;

// Cada premio se entrega una sola vez (o una vez al día si es daily).
// items: cosméticos que se agregan a la colección junto con las monedas.
export const siteRewards = {
  "visita-diaria": { coins: 20, daily: true, label: "Visita del día" },
  "juego-mision-tijuana": { coins: 40, label: "Abriste Misión Tijuana" },
  "juego-alerta-911": { coins: 40, label: "Abriste Alerta 911" },
  "juego-novela-visual": { coins: 40, label: "Abriste Un paso en falso" },
  "juego-cinco-segundos": { coins: 40, label: "Abriste 5 segundos" },
  "juego-cien-estudiantes": { coins: 40, label: "Abriste 100 estudiantes dijeron" },
  "juego-mochila": { coins: 40, label: "Abriste Arma tu mochila" },
  "mochila-lista": { coins: 100, items: ["espalda/mochila"], label: "Mochila de emergencia lista" },
  "plan-listo": { coins: 100, items: ["cuello/medalla"], label: "Plan familiar completo" },
  "botiquin-listo": { coins: 60, label: "Botiquín completo" },
  explorador: { coins: 60, items: ["marco/explorador"], label: "Visitaste todas las secciones" },
  // Monedas escondidas en los temas y en las páginas
  "moneda-conozca": { coins: 30, label: "Moneda escondida" },
  "moneda-planfamiliar": { coins: 30, label: "Moneda escondida" },
  "moneda-mochila": { coins: 30, label: "Moneda escondida" },
  "moneda-salud": { coins: 30, label: "Moneda escondida" },
  "moneda-911": { coins: 30, label: "Moneda escondida" },
  "moneda-consejos": { coins: 30, label: "Moneda escondida" },
  "moneda-equipo": { coins: 30, label: "Moneda escondida" },
  "moneda-familias": { coins: 30, label: "Moneda escondida" },
};

// Páginas que cuentan para el premio de explorador
export const explorerPages = ["/", "/juegos", "/informacion", "/consejos", "/equipo", "/migrantes"];
