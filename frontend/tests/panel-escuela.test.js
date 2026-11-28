// Panel de la escuela: resumen, docentes, grupos con su avance y descargas de su escuela.
import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

const panel = {
  totals: { teachers: 1, classrooms: 1, students: 2, active_students: 1, completions: 3, coins: 300 },
  teachers: [{ id: 1, name: "Laura Docente", active: true, classrooms: 1, students: 2, completions: 3, last_activity: "2026-11-20" }],
  classrooms: [{ id: 7, name: "3° A", grade: "3°", teacher: "Laura Docente", open: true, code: "ABC123", students: 2, completions: 3, coins: 300, last_activity: "2026-11-20" }],
  activities: [{ title: "Arma tu mochila", kind: "juego", completions: 3 }],
  weeks: [{ week: "2026-11-16", students: 2, completions: 3 }],
};
const progress = { tasks: [{ key: "mochila", title: "Arma tu mochila" }], students: [{ id: 1, name: "Ana Robles", done: ["mochila"], tasks_done: 1, coins_earned: 200 }] };
const api = vi.fn(async (path) => (path.includes("/avance") ? progress : panel));
vi.mock("../src/composables/api", () => ({ api: (...args) => api(...args) }));
const { default: SchoolDashboard } = await import("../src/components/SchoolDashboard.vue");

describe("Panel de la escuela", () => {
  it("muestra el resumen, los docentes, los grupos y lo más usado", async () => {
    const wrapper = mount(SchoolDashboard, { global: { stubs: { teleport: true } } });
    await flushPromises();
    const text = wrapper.text();
    expect(api).toHaveBeenCalledWith("/escuela/panel");
    expect(text).toContain("Así va tu escuela");
    expect(text).toContain("Cimacoins ganadas");
    expect(text).toContain("Laura Docente");
    expect(text).toContain("3° A");
    expect(text).toContain("Arma tu mochila");
    expect(wrapper.findAll(".export-list a").map((a) => a.attributes("href"))).toEqual([
      "/api/escuela/exportar/docentes",
      "/api/escuela/exportar/grupos",
      "/api/escuela/exportar/actividades",
    ]);
  });
  it("abre el avance de un grupo con el nombre de cada alumno", async () => {
    const wrapper = mount(SchoolDashboard, { global: { stubs: { teleport: true } } });
    await flushPromises();
    await wrapper.findAll("button").find((b) => b.text() === "Ver avance").trigger("click");
    await flushPromises();
    expect(api).toHaveBeenCalledWith("/escuela/grupos/7/avance");
    expect(wrapper.text()).toContain("Ana Robles");
    expect(wrapper.html()).toContain("/api/escuela/grupos/7/avance.csv");
  });
  it("pide el panel con las fechas de los atajos", async () => {
    const wrapper = mount(SchoolDashboard, { global: { stubs: { teleport: true } } });
    await flushPromises();
    await wrapper.findAll("button").find((b) => b.text() === "Últimos 30 días").trigger("click");
    await flushPromises();
    expect(api.mock.calls.at(-1)[0]).toMatch(/^\/escuela\/panel\?desde=\d{4}-\d{2}-\d{2}&hasta=\d{4}-\d{2}-\d{2}$/);
  });
});
