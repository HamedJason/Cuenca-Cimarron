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
    await wrapper.find("#exportar-desde").setValue("2026-11-01");
    await wrapper.find("#exportar-hasta").setValue("2026-11-30");
    expect(links()[2]).toBe("/api/admin/exportar/actividades?municipio=Mexicali&desde=2026-11-01&hasta=2026-11-30");
    // Fechas al revés: no deja descargar
    await wrapper.find("#exportar-hasta").setValue("2026-10-01");
    expect(wrapper.text()).toContain("La fecha final tiene que ser después de la inicial");
    expect(links()).toHaveLength(0);
  });
});
