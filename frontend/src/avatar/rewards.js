// Premios de Cimacoins del sitio. Archivo sin Vue ni arte para que lo usen el sitio,
// la tienda y el script que exporta el catálogo para la API (scripts/catalogo-avatar.mjs).

// Monedas con las que empieza toda cartera nueva (visitante o alumno).
export const STARTER_COINS = 150;
// Alumnos con sesión: cada punto de una actividad también da estas Cimacoins.
// Los puntos nunca se gastan; las Cimacoins sí.
export const COINS_PER_POINT = 10;

// Abrir un juego la primera vez da poco; terminarlo da el premio grande.
export const OPEN_COINS = 10;
export const FINISH_COINS = 40;

// Cada premio se entrega una sola vez (o una vez al día si es daily).
// items: cosméticos que se agregan a la colección junto con las monedas.
export const siteRewards = {
  "visita-diaria": { coins: 20, daily: true, label: "Visita del día" },
  "juego-mision-tijuana": { coins: OPEN_COINS, label: "Abriste Misión Tijuana" },
  "juego-alerta-911": { coins: OPEN_COINS, label: "Abriste Alerta 911" },
  "juego-novela-visual": { coins: OPEN_COINS, label: "Abriste Un paso en falso" },
  "juego-cinco-segundos": { coins: OPEN_COINS, label: "Abriste 5 segundos" },
  "juego-cien-estudiantes": { coins: OPEN_COINS, label: "Abriste 100 estudiantes dijeron" },
  "juego-mochila": { coins: OPEN_COINS, label: "Abriste Arma tu mochila" },
  "juego-memorama": { coins: OPEN_COINS, label: "Abriste el Memorama de emergencia" },
  "juego-alto-al-fuego": { coins: OPEN_COINS, label: "Abriste Alto al Fuego" },
  "juego-codigo-120": { coins: OPEN_COINS, label: "Abriste Código 120" },
  // Terminar cada juego vale más que abrirlo. activity: la actividad que lo comprueba.
  // Juegos propios: el juego avisa al ganar. Juegos de otros sitios: pregunta al regresar.
  // Con alumno, el servidor solo lo entrega si ya tiene esa actividad completa.
  "termino-mision-tijuana": { coins: FINISH_COINS, activity: "mision-tijuana", label: "Terminaste Misión Tijuana" },
  "termino-alerta-911": { coins: FINISH_COINS, activity: "alerta-911", label: "Terminaste Alerta 911" },
  "termino-novela-visual": { coins: FINISH_COINS, activity: "novela-visual", label: "Terminaste Un paso en falso" },
  "termino-cinco-segundos": { coins: FINISH_COINS, activity: "cinco-segundos", label: "Terminaste 5 segundos" },
  "termino-cien-estudiantes": { coins: FINISH_COINS, activity: "cien-estudiantes", label: "Terminaste 100 estudiantes dijeron" },
  "termino-mochila": { coins: FINISH_COINS, activity: "mochila", label: "Terminaste Arma tu mochila" },
  "termino-memorama": { coins: FINISH_COINS, activity: "memorama", label: "Terminaste el Memorama de emergencia" },
  "termino-alto-al-fuego": { coins: FINISH_COINS, activity: "alto-al-fuego", label: "Terminaste Alto al Fuego" },
  "termino-codigo-120": { coins: FINISH_COINS, activity: "codigo-120", label: "Terminaste Código 120" },
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

// Premio por terminar un juego o actividad (null si no tiene).
export const finishRewardId = (key) => (siteRewards[`termino-${key}`] ? `termino-${key}` : null);
