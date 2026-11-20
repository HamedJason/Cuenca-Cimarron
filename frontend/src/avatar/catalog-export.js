// Arma el catálogo que usa la API (backend/config/avatar-catalogo.json).
// Lo usan scripts/catalogo-avatar.mjs (para escribirlo) y la prueba que revisa que esté al día.
import { catalog, defaults, kits, secretKit } from "./art.js";
import { activities, bundleDiscount, itemPrice } from "./economy.js";
import { COINS_PER_POINT, STARTER_COINS, siteRewards } from "./rewards.js";

export function buildCatalog() {
  // Precio de cada pieza: 0 = inicial o "ninguno", null = no se vende (premio o secreto).
  const items = {};
  for (const group of Object.values(catalog)) {
    for (const item of group.items) items[`${group.id}/${item.id}`] = itemPrice(group.id, item.id);
  }
  return {
    starter: STARTER_COINS,
    per_point: COINS_PER_POINT,
    bundle_discount: bundleDiscount,
    defaults,
    items,
    kits: Object.fromEntries(kits.filter((kit) => kit.id !== secretKit.id).map((kit) => [kit.id, kit.state])),
    rewards: Object.fromEntries(
      Object.entries(siteRewards).map(([id, r]) => [
          id,
          { coins: r.coins, daily: Boolean(r.daily), items: r.items ?? [], activity: r.activity ?? null },
        ]),
    ),
    retos: Object.fromEntries(activities.map((a) => [a.id, { coins: a.coins, daily: a.id === "diario", clue: Boolean(a.clue) }])),
    secret: {
      pattern: activities.filter((a) => a.clue).map((a) => a.clue.signal),
      items: Object.entries(secretKit.state)
        .filter(([group, id]) => itemPrice(group, id) !== 0)
        .map(([group, id]) => `${group}/${id}`),
    },
  };
}
