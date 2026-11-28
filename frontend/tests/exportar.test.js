// Panel de datos: la sección Descargar datos solo sale para la administración y usa el municipio y las fechas.
import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

const data = {
  totals: { schools: 1, suspended_schools: 0, teachers: 1, classrooms: 1, students: 2, active_students: 0, completions: 1, coins_earned: 200 },
  schools: [],
  municipalities: [],
  colonias: [],
  levels: [],
  sectors: [],
  activities: [],
  weeks: [],
  municipio: null,
};
const api = vi.fn(async (path) => (path.startsWith("/admin/zonas") ? { total: 0, municipios: [], tijuana: [] } : data));
vi.mock("../src/composables/api", () => ({ api: (...args) => api(...args) }));
const { default: AdminStats } = await import("../src/components/AdminStats.vue");

describe("Panel de datos", () => {
  it("lista las escuelas sin actividad con su motivo", async () => {
    data.schools = [
      { id: 1, name: "Sin docentes", municipality: "Tijuana", teachers: 0, students: 0, last_activity: null },
      { id: 2, name: "Con uso", municipality: "Tijuana", teachers: 1, students: 3, last_activity: new Date().toISOString().slice(0, 10) },
      { id: 3, name: "Vieja", municipality: "Mexicali", teachers: 1, students: 2, last_activity: "2025-01-10" },
    ];
    const wrapper = mount(AdminStats, { props: { canExport: false } });
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain("Escuelas sin actividad");
    expect(text).toContain("Sin docentes. Nunca ha completado actividades");
    expect(text).toMatch(/Sin actividades desde el 10 ene\.? 2025/);
    expect(wrapper.findAll("table").at(-1).text()).not.toContain("Con uso");
    data.schools = [];
  });
});

describe("Descargar datos", () => {
  it("no sale para cuentas de solo lectura", async () => {
    const wrapper = mount(AdminStats, { props: { canExport: false } });
    await flushPromises();
    expect(wrapper.text()).not.toContain("Descargar datos");
  });
  it("arma los enlaces con municipio y fechas", async () => {
    const wrapper = mount(AdminStats, { props: { canExport: true } });
    await flushPromises();
    expect(wrapper.text()).toContain("Descargar datos");
    const links = () => wrapper.findAll(".export-list a").map((a) => a.attributes("href"));
    expect(links()).toHaveLength(6);
    expect(links()[0]).toBe("/api/admin/exportar/escuelas");
    await wrapper.find("#municipio-panel").setValue("Mexicali");
    const dates = () => wrapper.findAll(".date-filter input[type=date]");
    await dates()[0].setValue("2026-11-01");
    await dates()[1].setValue("2026-11-30");
    expect(links()[2]).toBe("/api/admin/exportar/actividades?municipio=Mexicali&desde=2026-11-01&hasta=2026-11-30");
    // El panel en pantalla también se pidió con esas fechas
    expect(api).toHaveBeenCalledWith("/admin/estadisticas?municipio=Mexicali&desde=2026-11-01&hasta=2026-11-30");
    // Fechas al revés: no deja descargar
    await dates()[1].setValue("2026-10-01");
    expect(wrapper.text()).toContain("La fecha final tiene que ser después de la inicial");
    expect(links()).toHaveLength(0);
  });
});
