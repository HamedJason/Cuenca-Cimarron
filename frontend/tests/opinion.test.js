// Comunidad Cimarrona: formulario, ventana obligatoria y aviso dentro de los juegos propios.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import OpinionForm from "../src/components/OpinionForm.vue";
import { requireOpinion, releaseGate, gate, lastSentAt, relativeDate, OPINION_KEYS } from "../src/composables/useOpinion";

const reply = (data, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) });

beforeEach(() => {
  localStorage.clear();
  lastSentAt.value = 0;
  releaseGate();
  document.cookie = "XSRF-TOKEN=x";
});
afterEach(() => vi.unstubAllGlobals());

describe("Formulario de opinión", () => {
  it("pide la calificación antes de mandar", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(OpinionForm);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Toca los cimarrones para calificar");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("manda calificación, comentario y un número del dispositivo, sin nombre", async () => {
    const fetch = vi.fn(() => reply({ saved: true, summary: { count: 1, average: 4, stars: {} } }, 201));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(OpinionForm);
    await wrapper.findAll("input[type=radio]")[3].setValue(true);
    await wrapper.find("textarea").setValue("  Me gustó el memorama ");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/opiniones");
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({ rating: 4, comment: "Me gustó el memorama", origin: "comunidad", sitio: "" });
    expect(body.device).toBe(localStorage.getItem(OPINION_KEYS.device));
    expect(Object.keys(body).sort()).toEqual(["comment", "device", "origin", "rating", "sitio"]);
    expect(wrapper.emitted("sent")).toHaveLength(1);
    expect(lastSentAt.value).toBeGreaterThan(0);
  });
  it("en la ventana obligatoria sin internet la guarda y deja seguir", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
    const wrapper = mount(OpinionForm, { props: { required: true } });
    await wrapper.findAll("input[type=radio]")[4].setValue(true);
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("sent")).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(OPINION_KEYS.pending)).rating).toBe(5);
  });
});

describe("Opinión al terminar una actividad", () => {
  it("espera a que opine y no vuelve a pedirla en la misma hora", async () => {
    let done = false;
    requireOpinion().then(() => (done = true));
    await flushPromises();
    expect(gate.value).not.toBe(null);
    expect(done).toBe(false);
    lastSentAt.value = Date.now();
    releaseGate();
    await flushPromises();
    expect(done).toBe(true);
    await requireOpinion();
    expect(gate.value).toBe(null);
    lastSentAt.value = Date.now() - 61 * 60 * 1000;
    requireOpinion();
    expect(gate.value).not.toBe(null);
  });
  it("fechas relativas sin hora exacta", () => {
    const now = Date.parse("2026-11-26T12:00:00Z");
    expect(relativeDate("2026-11-26T11:50:00Z", now)).toBe("hace un momento");
    expect(relativeDate("2026-11-26T09:00:00Z", now)).toBe("hace 3 horas");
    expect(relativeDate("2026-11-25T12:00:00Z", now)).toBe("ayer");
  });
});

describe("Juegos propios", () => {
  const load = () => {
    delete window.CuencaPuntos;
    new Function(readFileSync("public/juegos/cuenca-puntos.js", "utf8"))();
  };
  it("al terminar tapa la pantalla hasta mandar la opinión", async () => {
    document.body.innerHTML = "";
    const fetch = vi.fn((url) => (url === "/api/opiniones" ? reply({ saved: true }, 201) : reply({}, 401)));
    vi.stubGlobal("fetch", fetch);
    load();
    window.CuencaPuntos.terminar("memorama");
    const box = document.querySelector(".cc-op");
    expect(box).not.toBe(null);
    await flushPromises();
    expect(document.querySelector("[role=status]")).toBe(null);
    box.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    expect(box.querySelector(".cc-op-error").textContent).toContain("Toca los cimarrones");
    box.querySelectorAll(".cc-op-star")[2].click();
    box.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
    await flushPromises();
    const call = fetch.mock.calls.find(([url]) => url === "/api/opiniones");
    expect(JSON.parse(call[1].body)).toMatchObject({ rating: 3, origin: "actividad", comment: null });
    expect(document.querySelector(".cc-op")).toBe(null);
    // El aviso de entrar con el grupo sale hasta después de opinar
    expect(document.querySelector("[role=status]").textContent).toContain("Entra con el código de tu grupo");
    expect(Number(localStorage.getItem(OPINION_KEYS.sent))).toBeGreaterThan(0);
    // En la siguiente partida, dentro de la hora, ya no se pide
    load();
    window.CuencaPuntos.terminar("mochila");
    expect(document.querySelector(".cc-op")).toBe(null);
  });
});
