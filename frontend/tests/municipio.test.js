// Sitio por municipio: el municipio elegido se guarda en el navegador y cambia los números locales.
// Si falta un número del municipio se muestra el 911 con un aviso, nunca el número de Tijuana.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { buscarMunicipio, estacionesDe, faltantes, llamadas, municipios, riesgosDe, telefono, textos, todosLosRiesgos } from "../src/municipios.js";
import { emergency, helpLines } from "../src/data.js";
import {
  MUNICIPIO_KEY,
  borrarMunicipio,
  fijarMunicipio,
  municipio,
  municipioActual,
  municipioDeUrl,
} from "../src/composables/useMunicipio.js";

// El 073 es el número de reportes de todos los organismos de agua: no cuenta como número de Tijuana
const tijuanaNumbers = Object.values(buscarMunicipio("tijuana").telefonos)
  .flatMap((t) => t?.numeros ?? [])
  .filter((n) => n !== "073");

beforeEach(() => {
  localStorage.clear();
  borrarMunicipio();
});

describe("useMunicipio", () => {
  it("sin municipio guardado se muestra Tijuana", () => {
    expect(municipio.value).toBeNull();
    expect(municipioActual.value.id).toBe("tijuana");
  });
  it("fijar lo guarda en el navegador y borrar lo quita", () => {
    expect(fijarMunicipio("mexicali").nombre).toBe("Mexicali");
    expect(localStorage.getItem(MUNICIPIO_KEY)).toBe("mexicali");
    expect(municipioActual.value.id).toBe("mexicali");
    borrarMunicipio();
    expect(localStorage.getItem(MUNICIPIO_KEY)).toBeNull();
    expect(municipioActual.value.id).toBe("tijuana");
  });
  it("acepta el nombre de zonas.js y el de la SEP, y rechaza lo que no es de Baja California", () => {
    expect(fijarMunicipio("San Quintín").id).toBe("san-quintin");
    expect(fijarMunicipio("Playas de Rosarito").id).toBe("rosarito");
    expect(fijarMunicipio("Rosarito").id).toBe("rosarito");
    expect(fijarMunicipio("Tecate").id).toBe("tecate");
    expect(fijarMunicipio("Los Ángeles")).toBeNull();
    expect(municipioActual.value.id).toBe("tecate");
  });
  it("?municipio= en la dirección fija el municipio", () => {
    expect(municipioDeUrl("?municipio=ensenada").id).toBe("ensenada");
    expect(localStorage.getItem(MUNICIPIO_KEY)).toBe("ensenada");
    expect(municipioDeUrl("?otra=1")).toBeNull();
    expect(municipioActual.value.id).toBe("ensenada");
  });
  it("al cargar lee lo guardado y si está mal usa Tijuana", async () => {
    localStorage.setItem(MUNICIPIO_KEY, "san-felipe");
    vi.resetModules();
    const fresh = await import("../src/composables/useMunicipio.js");
    expect(fresh.municipioActual.value.id).toBe("san-felipe");
    localStorage.setItem(MUNICIPIO_KEY, "otro-lugar");
    vi.resetModules();
    const bad = await import("../src/composables/useMunicipio.js");
    expect(bad.municipio.value).toBeNull();
    expect(bad.municipioActual.value.id).toBe("tijuana");
  });
});

describe("Datos por municipio", () => {
  it("están los 7 municipios con los nombres de zonas.js", () => {
    expect(municipios.map((m) => m.zona)).toEqual(["Tijuana", "Rosarito", "Tecate", "Ensenada", "Mexicali", "San Quintín", "San Felipe"]);
  });
  it("Tijuana tiene sus números locales", () => {
    const tj = buscarMunicipio("tijuana");
    expect(telefono(tj, "proteccionCivil")).toMatchObject({ numeros: ["664 683 9112", "664 683 9131"], falta: false });
    expect(telefono(tj, "bomberos").numeros).toEqual(["664 688 5705"]);
  });
  it("los otros municipios tienen sus números con tipo y fuente", () => {
    const mxl = buscarMunicipio("mexicali");
    expect(telefono(mxl, "proteccionCivil")).toMatchObject({ numeros: ["686 554 9211"], tipo: "Oficina", falta: false });
    expect(llamadas(telefono(mxl, "cruzRoja"))).toEqual([
      { numero: "686 563 6901", tipo: "General" },
      { numero: "686 563 6900", tipo: "Ambulancia" },
    ]);
    expect(telefono(buscarMunicipio("tecate"), "bomberos").numeros).toEqual(["665 654 1711"]);
    expect(llamadas(telefono(buscarMunicipio("san-quintin"), "cruzRoja"))[0].tipo).toBe("Oficina, por confirmar");
    for (const m of municipios) {
      for (const dato of Object.values(m.telefonos).filter(Boolean)) {
        if (m.id !== "tijuana") expect(dato.fuente).toMatch(/^https:\/\//);
      }
    }
  });
  it("si falta un número da el 911 con aviso y nunca el de Tijuana", () => {
    const sq = buscarMunicipio("san-quintin");
    for (const key of ["proteccionCivil", "bomberos", "policia"]) {
      const found = telefono(sq, key);
      expect(found.falta).toBe(true);
      expect(found.numeros).toEqual(["911"]);
    }
    // Ni el conmutador del C5 ni el número de Sindicatura
    const sqNumbers = Object.values(sq.telefonos).flatMap((t) => t?.numeros ?? []);
    expect(sqNumbers).not.toContain("616 166 1000");
    expect(sqNumbers).not.toContain("616 598 0027");
    for (const m of municipios.filter((item) => item.id !== "tijuana")) {
      const numbers = Object.values(m.telefonos).flatMap((t) => t?.numeros ?? []);
      expect(numbers.some((n) => tijuanaNumbers.includes(n))).toBe(false);
    }
    expect(telefono(sq, "bomberos").aviso).toBe("Aún no tenemos este número para San Quintín, en emergencia llama al 911");
  });
  it("la policía de San Quintín cae al 911 y la de los demás es de oficina", () => {
    const sq = telefono(buscarMunicipio("san-quintin"), "policia");
    expect(sq).toMatchObject({ falta: true, numeros: ["911"] });
    expect(telefono(buscarMunicipio("mexicali"), "policia")).toMatchObject({ numeros: ["686 558 1200"], tipo: "Oficina", falta: false });
    expect(llamadas(telefono(buscarMunicipio("rosarito"), "policia"))[0]).toEqual({ numero: "661 614 9600", tipo: "Conmutador, ext. 4033" });
  });
  it("el agua de San Felipe la atiende la CESPM y la de San Quintín la CESPE", () => {
    const sf = telefono(buscarMunicipio("san-felipe"), "agua");
    expect(sf).toMatchObject({ nombre: "CESPM", whatsapp: "686 569 8020", falta: false });
    expect(sf.numeros).toEqual(["073", "686 564 6101", "686 564 2610"]);
    expect(llamadas(sf)[2].tipo).toBe("Centro de Atención San Felipe, oficina");
    expect(telefono(buscarMunicipio("san-quintin"), "agua").nombre).toBe("CESPE");
    expect(telefono(buscarMunicipio("tecate"), "agua").nombre).toBe("CESPTE");
    expect(telefono(buscarMunicipio("rosarito"), "agua").nombre).toBe("CESPT");
  });
  it("el 075 es estatal y no dice que sea solo de Tijuana", () => {
    const line = helpLines.find((item) => item.id === "075");
    expect(line.note).not.toMatch(/Tijuana/);
    expect(line.what).toContain("Estado");
  });
  it("las estaciones sin city son de Tijuana", () => {
    const rosarito = estacionesDe(buscarMunicipio("rosarito"), emergency.fireStations);
    expect(rosarito.map((s) => s.id)).toEqual(["rosarito-bomberos-centro"]);
    const tijuana = estacionesDe(buscarMunicipio("tijuana"), emergency.fireStations);
    expect(tijuana.some((s) => s.city)).toBe(false);
    expect(tijuana.length).toBeGreaterThan(10);
    expect(estacionesDe(buscarMunicipio("mexicali"), emergency.policeStations)).toEqual([]);
  });
  it("refugios de octubre de 2026 en los otros municipios, sin coordenadas inventadas", () => {
    const counts = Object.fromEntries(municipios.map((m) => [m.id, m.refugios?.length ?? 0]));
    expect(counts).toEqual({ tijuana: 0, rosarito: 3, tecate: 4, ensenada: 3, mexicali: 6, "san-quintin": 19, "san-felipe": 3 });
    for (const m of municipios) for (const r of m.refugios ?? []) expect(r.lat).toBeUndefined();
    // Los de Tijuana sí tienen punto en el mapa
    expect(emergency.shelters.every((r) => r.lat && r.lng)).toBe(true);
  });
  it("estaciones de bomberos de otros municipios con teléfono y sin punto en el mapa", () => {
    const mxl = estacionesDe(buscarMunicipio("mexicali"), emergency.fireStations);
    expect(mxl).toHaveLength(9);
    expect(mxl[0]).toMatchObject({ name: "Central de Bomberos", phone: "686 561 8212" });
    expect(estacionesDe(buscarMunicipio("ensenada"), emergency.fireStations)).toHaveLength(3);
    expect(estacionesDe(buscarMunicipio("tecate"), emergency.fireStations).map((s) => s.phone)).toEqual(["665 654 1711"]);
    expect(estacionesDe(buscarMunicipio("san-felipe"), emergency.fireStations)[0].address).toBe("Av. Mar Blanco 759");
    for (const st of emergency.fireStations.filter((s) => s.city && s.city !== "Rosarito")) {
      expect(st.phone).toBeTruthy();
      expect(st.lat).toBeUndefined();
    }
  });
  it("cada municipio muestra sus 3 riesgos más significativos en orden", () => {
    const tipos = (id) => riesgosDe(buscarMunicipio(id)).map((r) => r.tipo);
    expect(tipos("tijuana")).toEqual(["lluvia", "deslave", "inundacion"]);
    expect(riesgosDe(buscarMunicipio("tijuana")).map((r) => r.titulo)).toEqual(["Lluvias fuertes", "Deslaves", "Inundaciones"]);
    expect(tipos("rosarito")).toEqual(["deslave", "inundacion", "tsunami"]);
    expect(tipos("tecate")).toEqual(["frio", "incendio", "deslave"]);
    expect(tipos("ensenada")).toEqual(["inundacion", "incendio", "tsunami"]);
    expect(tipos("mexicali")).toEqual(["calor", "sismo", "tolvanera"]);
    expect(tipos("san-quintin")).toEqual(["sequia", "sismo", "tsunami"]);
    expect(tipos("san-felipe")).toEqual(["calor", "sismo", "tsunami"]);
    for (const m of municipios) expect(riesgosDe(m)).toHaveLength(3);
    // San Felipe ya no muestra inundación ni deslaves, pero el dato sigue guardado
    expect(tipos("san-felipe")).not.toContain("inundacion");
    expect(todosLosRiesgos(buscarMunicipio("san-felipe")).some((r) => r.tipo === "inundacion" && r.destacado === false)).toBe(true);
    expect(riesgosDe(buscarMunicipio("san-quintin"))[0].antiguedad).toBe("Dato histórico de 2012");
  });
  it("cada riesgo tiene su animación y los archivos existen", async () => {
    const fs = await import("node:fs");
    const tipos = new Set();
    for (const m of municipios) for (const r of todosLosRiesgos(m)) {
      expect(r.clip).toBeTruthy();
      tipos.add(r.clip);
    }
    for (const clip of tipos) for (const ext of ["mp4", "webm", "webp"]) {
      expect(fs.existsSync(`public/assets/animaciones/riesgo-${clip}.${ext}`)).toBe(true);
    }
    expect([...tipos].sort()).toEqual(["calor", "deslave", "frio", "incendio", "inundacion", "lluvia", "sequia", "sismo", "tolvanera", "tsunami", "viento"]);
  });
  it("ningún riesgo trae una temporada inventada y cada animación sale una sola vez", () => {
    // Donde la fuente no da temporada, el campo no existe
    const sinTemporada = {
      mexicali: ["Sismos"],
      "san-quintin": ["Sequía", "Sismos", "Tsunami"],
      "san-felipe": ["Sismos", "Tsunami (escenario de peligro)"],
      rosarito: ["Tsunami (zonas susceptibles)"],
      ensenada: ["Tsunami de origen lejano"],
      tijuana: ["Lluvias fuertes", "Sismos"],
    };
    for (const m of municipios) {
      const lista = riesgosDe(m);
      for (const r of lista) {
        if (sinTemporada[m.id]?.includes(r.titulo)) expect(r.temporada).toBeUndefined();
        if (r.temporada) expect(r.temporada).not.toMatch(/no encontrado/i);
        if (m.id !== "tijuana" || r.zonas) expect(r.fuente).toMatch(/^https:\/\//);
      }
      const clips = lista.map((r) => r.clip).filter(Boolean);
      expect(new Set(clips).size).toBe(clips.length);
    }
  });
  it("los títulos usan el nombre del municipio", () => {
    expect(textos(buscarMunicipio("ensenada")).titulo).toBe("Ensenada se prepara para El Niño");
    expect(textos(buscarMunicipio("tijuana")).titulo).toBe("Tijuana se prepara para El Niño");
  });
  it("la lista de faltantes de Tijuana está vacía", () => {
    expect(faltantes().find((f) => f.id === "tijuana").faltan).toEqual([]);
    expect(faltantes().find((f) => f.id === "mexicali").faltan).toEqual([]);
    expect(faltantes().find((f) => f.id === "tecate").faltan).toEqual(["atlas"]);
    expect(faltantes().find((f) => f.id === "san-quintin").faltan).toEqual(["proteccionCivil", "bomberos", "policia", "atlas"]);
  });
});

describe("Directorio por municipio", () => {
  it("en Mexicali salen sus números con tipo y nunca los de Tijuana", async () => {
    localStorage.setItem(MUNICIPIO_KEY, "mexicali");
    vi.resetModules();
    const { default: Directory } = await import("../src/views/Directory.vue");
    const text = mount(Directory).text();
    expect(text).toContain("Protección Civil Mexicali");
    expect(text).toContain("686 554 9211");
    expect(text).toContain("686 563 6900");
    expect(text).toContain("Ambulancia");
    expect(text).toContain("En emergencia llama al 911");
    expect(text).toContain("Apoyo psicológico (citas)");
    expect(text).toContain("No es línea de crisis");
    expect(text).toContain("075");
    expect(text).not.toContain("Solo en Tijuana");
    expect(text).not.toContain("664 683 9112");
    expect(text).not.toContain("Escuadrón Violeta");
    expect(text).not.toContain("CESPT");
    expect(text).toContain("Agua y drenaje, CESPM");
    // Línea Violeta estatal y centros de atención a mujeres del municipio
    expect(text).toContain("Línea Violeta");
    expect(text).toContain("686 837 3700");
    expect(text).toContain("CEJUM");
  });
  it("en San Felipe sale el agua de la CESPM y su policía", async () => {
    localStorage.setItem(MUNICIPIO_KEY, "san-felipe");
    vi.resetModules();
    const { default: Directory } = await import("../src/views/Directory.vue");
    const text = mount(Directory).text();
    expect(text).toContain("Agua y drenaje, CESPM");
    expect(text).toContain("686 564 2610");
    expect(text).toContain("686 577 1134");
    expect(text).toContain("Línea Violeta");
    expect(text).not.toContain("Escuadrón Violeta");
  });
  it("en Rosarito Protección Civil y Bomberos salen en una sola tarjeta", async () => {
    localStorage.setItem(MUNICIPIO_KEY, "rosarito");
    vi.resetModules();
    const { default: Directory } = await import("../src/views/Directory.vue");
    const text = mount(Directory).text();
    expect(text).toContain("Protección Civil y Bomberos Rosarito");
    // Ninguna tarjeta sola de "Bomberos Rosarito"
    expect(text.split("Bomberos Rosarito").length).toBe(text.split("Protección Civil y Bomberos Rosarito").length);
    expect(text).toContain("IMMUJER");
  });
  it("en Tijuana salen sus números", async () => {
    localStorage.removeItem(MUNICIPIO_KEY);
    vi.resetModules();
    const { default: Directory } = await import("../src/views/Directory.vue");
    const text = mount(Directory).text();
    expect(text).toContain("664 683 9112");
    expect(text).toContain("Escuadrón Violeta");
    expect(text).not.toContain("Aún no tenemos");
  });
});
