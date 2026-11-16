// Catálogo oficial de escuelas (Catálogo de Centros de Trabajo de la SEP en datos.gob.mx).
// El navegador del administrador lo pide a datos.gob.mx y lo manda a la API por partes.
import { api } from "./api";

// Para el catálogo de otro año se cambia el recurso: datos.gob.mx/dataset/catalogo_centros_trabajo_sep
export const SEP_CATALOG = {
  year: 2026,
  resourceId: "c086fc57-fb58-49b8-aeeb-c0a017372f40",
  municipalities: ["Tijuana", "Playas de Rosarito"],
  types: ["escuela", "plantel (media superior)"],
};

const clean = (value) => {
  const text = String(value ?? "").trim();
  return !text || /^(sin dato|ninguno|nan|null)$/i.test(text) ? null : text;
};

export function mapSepRecord(raw) {
  const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
  const cct = String(r.cv_cct ?? "").trim().toUpperCase();
  if (!/^\d{2}[A-Z]{3}\d{4}[A-Z]$/.test(cct)) return null;
  const n1 = (clean(r.tiponivelsub_c_servicion1) ?? "").toLowerCase();
  const n2 = (clean(r.tiponivelsub_c_servicion2) ?? "").toLowerCase();
  const n3 = clean(r.tiponivelsub_c_servicion3);
  const level = ["preescolar", "primaria", "secundaria"].includes(n2)
    ? n2
    : n1 === "media superior" || n2 === "media superior"
      ? "media-superior"
      : null;
  const turno = (clean(r.c_turno_01) ?? "").toLowerCase();
  const shift = turno.includes("matutino")
    ? "matutino"
    : turno.includes("vespertino")
      ? "vespertino"
      : turno.includes("nocturno")
        ? "nocturno"
        : /continuo|completo/.test(turno)
          ? "completo"
          : null;
  const control = (clean(r.sostenimiento_c_control) ?? "").toLowerCase();
  const number = Number(r.inmueble_n_extnum);
  const street = clean(r.inmueble_c_vialidad_principal);
  const cp = String(r.inmueble_cv_codigo_postal ?? "").replace(/\D/g, "");
  const lat = Number(r.inmueble_latitud);
  const lng = Number(r.inmueble_longitud);
  return {
    cct,
    name: (clean(r.c_nombre) ?? cct).slice(0, 200),
    level,
    level_detail: [n2, n3].filter(Boolean).join(", ").slice(0, 60) || null,
    shift,
    sector: control.startsWith("público") || control === "publico" ? "publica" : control.startsWith("privado") ? "privada" : null,
    colonia: clean(r.inmueble_c_nom_asen)?.slice(0, 160) ?? null,
    address: street ? `${street}${number > 0 ? ` ${number}` : ""}`.slice(0, 220) : null,
    postal_code: cp ? cp.padStart(5, "0").slice(-5) : null,
    municipality: clean(r.inmueble_c_nom_mun),
    lat: lat >= 31.5 && lat <= 33.5 ? lat : null,
    lng: lng >= -118 && lng <= -115.5 ? lng : null,
  };
}

// Pide las escuelas de cada municipio a datos.gob.mx, de 1000 en 1000.
export async function fetchSepCatalog(onProgress = () => {}) {
  const schools = new Map();
  for (const municipality of SEP_CATALOG.municipalities) {
    for (let offset = 0; ; offset += 1000) {
      const filters = { inmueble_c_nom_ent: "Baja California", inmueble_c_nom_mun: municipality, c_tipo: SEP_CATALOG.types };
      const url = `https://www.datos.gob.mx/api/3/action/datastore_search?resource_id=${SEP_CATALOG.resourceId}&limit=1000&offset=${offset}&filters=${encodeURIComponent(JSON.stringify(filters))}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error("datos.gob.mx no respondió. Intenta más tarde");
      const data = await response.json();
      const records = data?.result?.records ?? [];
      for (const record of records) {
        const school = mapSepRecord(record);
        if (school && school.municipality === municipality) schools.set(school.cct, school);
      }
      onProgress(`${municipality}: ${offset + records.length} registros revisados`);
      if (records.length < 1000) break;
    }
  }
  return [...schools.values()];
}

// Manda el catálogo a la API en partes de 500.
export async function uploadCatalog(schools, onProgress = () => {}) {
  let total = 0;
  for (let i = 0; i < schools.length; i += 500) {
    const data = await api("/admin/catalogo-escuelas", { method: "POST", body: { first: i === 0, schools: schools.slice(i, i + 500) }, signal: AbortSignal.timeout(60000) });
    total = data.total;
    onProgress(`Guardadas ${Math.min(i + 500, schools.length)} de ${schools.length}`);
  }
  return total;
}

export const searchCatalog = (q, signal) => api(`/catalogo-escuelas?q=${encodeURIComponent(q)}`, { signal }).then((d) => d.schools);
