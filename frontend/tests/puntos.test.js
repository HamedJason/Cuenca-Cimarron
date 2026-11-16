import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import PointsTag from "../src/components/PointsTag.vue";
import ActivityQuestion from "../src/components/ActivityQuestion.vue";
import { student, progress } from "../src/composables/useStudent";
import { activities } from "../src/composables/useActivities";
import { tasks } from "../src/composables/useTasks";

const catalog = [
  { key: "lectura-conozca", title: "Qué es El Niño", kind: "lectura", mode: "pregunta", points: 10, route: "/informacion?tema=conozca", question: { text: "¿Qué es El Niño?", options: ["A", "B", "C"] } },
  { key: "mochila", title: "Arma tu mochila", kind: "juego", mode: "aviso", points: 20, route: "/juegos?juego=mochila", question: null },
];

beforeEach(() => {
  activities.value = catalog;
  student.value = null;
  progress.value = { points: 0, completed: [] };
  tasks.value = [];
});
afterEach(() => vi.unstubAllGlobals());

describe("Etiquetas de puntos", () => {
  it("los visitantes sin cuenta no ven etiquetas", () => {
    expect(mount(PointsTag, { props: { activityKey: "lectura-conozca" } }).text()).toBe("");
    expect(mount(PointsTag).text()).toBe("");
  });
  it("con sesión muestra los puntos, la tarea y cambia a Completada", async () => {
    student.value = { name: "Ana" };
    tasks.value = [{ key: "mochila" }];
    const wrapper = mount(PointsTag, { props: { activityKey: "mochila" } });
    expect(wrapper.text()).toContain("+20 puntos");
    expect(wrapper.text()).toContain("Tarea");
    progress.value = { points: 20, completed: ["mochila"] };
    await flushPromises();
    expect(wrapper.text()).toContain("Completada");
    expect(wrapper.text()).not.toContain("+20");
    expect(mount(PointsTag).text()).toBe("Para consultar");
  });
});

describe("Pregunta de una lectura", () => {
  it("manda la opción elegida y suma lo que dice el servidor", async () => {
    student.value = { name: "Ana" };
    document.cookie = "XSRF-TOKEN=x";
    const fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ completed: true, new: true, points: 10, total: 10 }) }));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "lectura-conozca" } });
    await wrapper.findAll("input[type=radio]")[2].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/actividades/lectura-conozca/respuesta");
    expect(JSON.parse(options.body)).toEqual({ answer: 2 });
    expect(wrapper.text()).toContain("Sumaste 10 puntos");
    expect(progress.value).toEqual({ points: 10, completed: ["lectura-conozca"] });
  });
  it("si se equivoca deja intentar otra vez", async () => {
    student.value = { name: "Ana" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 422, json: () => Promise.resolve({ message: "Esa no es. Vuelve a leer y contesta otra vez." }) })));
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "lectura-conozca" } });
    await wrapper.findAll("input[type=radio]")[0].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Esa no es");
    expect(wrapper.find("button").exists()).toBe(true);
    expect(progress.value.completed).toEqual([]);
  });
});

describe("cuenca-puntos.js", () => {
  const load = () => {
    delete window.CuencaPuntos;
    new Function(readFileSync("public/juegos/cuenca-puntos.js", "utf8"))();
  };
  it("sin sesión no guarda nada ni avisa", async () => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) })));
    load();
    window.CuencaPuntos.terminar("mochila");
    await flushPromises();
    expect(localStorage.getItem("cuenca.puntos.pendientes")).toBe(null);
    expect(document.querySelector("[role=status]")).toBe(null);
  });
  it("sin internet guarda el aviso para reintentarlo", async () => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
    load();
    window.CuencaPuntos.terminar("mochila");
    window.CuencaPuntos.terminar("mochila");
    await flushPromises();
    expect(JSON.parse(localStorage.getItem("cuenca.puntos.pendientes"))).toEqual(["mochila"]);
  });
  it("ignora claves raras", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    load();
    window.CuencaPuntos.terminar("../admin");
    expect(fetch).not.toHaveBeenCalled();
  });
});
