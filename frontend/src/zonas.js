// Zona aproximada del visitante, calculada solo en el navegador.
// La ubicación se redondea a dos decimales (más o menos 1 km) y se convierte en un nombre:
// el municipio de Baja California y, en Tijuana, la delegación más cercana.
// Las coordenadas nunca salen del navegador ni se guardan.
// Los nombres deben coincidir con backend/config/zonas.php.
import { emergency } from "./data";

// Cabeceras municipales de Baja California
export const municipios = [
  { name: "Tijuana", lat: 32.5149, lng: -117.0382 },
  { name: "Rosarito", lat: 32.3615, lng: -117.0554 },
  { name: "Tecate", lat: 32.5725, lng: -116.6266 },
  { name: "Ensenada", lat: 31.8667, lng: -116.5964 },
  { name: "Mexicali", lat: 32.6245, lng: -115.4523 },
  { name: "San Quintín", lat: 30.5603, lng: -115.9386 },
  { name: "San Felipe", lat: 31.0256, lng: -114.837 },
];
export const OUTSIDE = "Fuera de Baja California";
// Respuesta guardada en el navegador para preguntar una sola vez ("listo", "no" o "sin-ubicacion")
export const ZONE_KEY = "cuenca.zona";

// Delegaciones de Tijuana: el centro es la sede de la policía de cada delegación (data.js).
export const delegaciones = emergency.policeStations
  .filter((s) => !s.city && s.name.startsWith("Delegación "))
  .map((s) => ({ name: s.name.slice("Delegación ".length), lat: s.lat, lng: s.lng }));

const round = (value) => Math.round(value * 100) / 100;
// Distancia aproximada en km (suficiente para elegir el punto más cercano)
function km(a, b) {
  const dy = (a.lat - b.lat) * 111;
  const dx = (a.lng - b.lng) * 111 * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.hypot(dx, dy);
}
// Caja de Baja California (de la frontera norte al paralelo 28 y del Pacífico al río Colorado)
const insideBC = (p) => p.lat >= 28 && p.lat <= 32.72 && p.lng >= -117.2 && p.lng <= -114.65;

export function zonaDe(lat, lng) {
  const p = { lat: round(lat), lng: round(lng) };
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng) || !insideBC(p)) return { municipio: OUTSIDE, zona: OUTSIDE };
  const candidates = [
    ...delegaciones.map((d) => ({ municipio: "Tijuana", zona: d.name, point: d })),
    ...municipios.filter((m) => m.name !== "Tijuana").map((m) => ({ municipio: m.name, zona: m.name, point: m })),
  ];
  let best = null;
  for (const c of candidates) {
    const d = km(p, c.point);
    if (!best || d < best.d) best = { ...c, d };
  }
  return { municipio: best.municipio, zona: best.zona };
}
