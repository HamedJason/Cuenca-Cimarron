// Zona aproximada del visitante: se calcula en el navegador y al servidor solo va el nombre.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/" }) }));

const { zonaDe, delegaciones, OUTSIDE, ZONE_KEY } = await import("../src/zonas.js");
const { default: LocationAsk } = await import("../src/components/LocationAsk.vue");

describe("zonaDe", () => {
  it("en Tijuana da la delegación más cercana", () => {
    expect(zonaDe(32.5229, -117.1124)).toEqual({ municipio: "Tijuana", zona: "Playas" });
    expect(zonaDe(32.5405, -117.0478)).toEqual({ municipio: "Tijuana", zona: "Zona Centro" });
    expect(delegaciones.map((d) => d.name)).toContain("San Antonio de los Buenos");
  });
  it("fuera de Tijuana da el municipio", () => {
    expect(zonaDe(31.87, -116.6)).toEqual({ municipio: "Ensenada", zona: "Ensenada" });
    expect(zonaDe(32.63, -115.45)).toEqual({ municipio: "Mexicali", zona: "Mexicali" });
    expect(zonaDe(32.34, -117.06)).toEqual({ municipio: "Rosarito", zona: "Rosarito" });
  });
  it("fuera de Baja California no dice dónde", () => {
    expect(zonaDe(34.05, -118.24)).toEqual({ municipio: OUTSIDE, zona: OUTSIDE });
    expect(zonaDe(Number.NaN, 0)).toEqual({ municipio: OUTSIDE, zona: OUTSIDE });
  });
});

describe("Aviso de la primera visita", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("con Ahora no se recuerda y no vuelve a salir", async () => {
    const wrapper = mount(LocationAsk);
    vi.advanceTimersByTime(7000);
    await flushPromises();
    expect(wrapper.text()).toContain("¿Nos dices de qué parte de Baja California nos visitas?");
    await wrapper.findAll("button")[1].trigger("click");
    expect(localStorage.getItem(ZONE_KEY)).toBe("no");
    expect(wrapper.find(".zone-ask").exists()).toBe(false);
    const again = mount(LocationAsk);
    vi.advanceTimersByTime(7000);
    await flushPromises();
    expect(again.find(".zone-ask").exists()).toBe(false);
  });

  it("con Sí manda solo municipio, zona y fecha, nunca coordenadas", async () => {
    const fetch = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (ok) => ok({ coords: { latitude: 32.52287, longitude: -117.11234 } }) } });
    const wrapper = mount(LocationAsk);
    vi.advanceTimersByTime(7000);
    await flushPromises();
    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/visitas/zona");
    const body = JSON.parse(options.body);
    expect(Object.keys(body).sort()).toEqual(["fecha", "municipio", "zona"]);
    expect(body).toMatchObject({ municipio: "Tijuana", zona: "Playas" });
    expect(options.body).not.toContain("32.5");
    expect(wrapper.text()).toContain("Nos visitas desde Tijuana, Playas");
    expect(localStorage.getItem(ZONE_KEY)).toBe("listo");
  });

  it("si niegan el permiso el sitio sigue y no manda nada", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) } });
    const wrapper = mount(LocationAsk);
    vi.advanceTimersByTime(7000);
    await flushPromises();
    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.find(".zone-ask").exists()).toBe(false);
    expect(localStorage.getItem(ZONE_KEY)).toBe("no");
  });
});
