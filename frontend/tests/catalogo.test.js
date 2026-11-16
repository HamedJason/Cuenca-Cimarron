import { describe, expect, it } from "vitest";
import { mapSepRecord } from "../src/composables/useCatalog";

describe("Catálogo de escuelas de la SEP", () => {
  it("convierte un registro de datos.gob.mx a los datos del registro", () => {
    const school = mapSepRecord({
      cv_cct: "02dpb0007n",
      c_nombre: "Juan Jose de Los Reyes Martinez el Pipila",
      c_tipo: "escuela",
      inmueble_c_vialidad_principal: "Calle Manuel Félix Acosta",
      inmueble_n_extnum: "120",
      inmueble_c_nom_mun: "Tijuana",
      inmueble_c_nom_asen: "Obrera",
      inmueble_cv_codigo_postal: "22001",
      inmueble_latitud: "32.497",
      inmueble_longitud: "-117.08",
      sostenimiento_c_control: "público",
      c_turno_01: "2 - vespertino",
      tiponivelsub_c_servicion1: "básica",
      tiponivelsub_c_servicion2: "primaria",
      tiponivelsub_c_servicion3: "indígena",
    });
    expect(school).toEqual({
      cct: "02DPB0007N",
      name: "Juan Jose de Los Reyes Martinez el Pipila",
      level: "primaria",
      level_detail: "primaria, indígena",
      shift: "vespertino",
      sector: "publica",
      colonia: "Obrera",
      address: "Calle Manuel Félix Acosta 120",
      postal_code: "22001",
      municipality: "Tijuana",
      lat: 32.497,
      lng: -117.08,
    });
  });

  it("acepta los nombres de columna en mayúsculas del catálogo 2025 y limpia los sin dato", () => {
    const school = mapSepRecord({
      CV_CCT: "02PBH0001Z",
      C_NOMBRE: "PREPARATORIA EJEMPLO",
      INMUEBLE_C_NOM_MUN: "PLAYAS DE ROSARITO",
      INMUEBLE_C_NOM_ASEN: "sin dato",
      INMUEBLE_N_EXTNUM: 0,
      INMUEBLE_LATITUD: 0,
      SOSTENIMIENTO_C_CONTROL: "PRIVADO",
      C_TURNO_01: "5 - CONTINUO (TIEMPO COMPLETO)",
      TIPONIVELSUB_C_SERVICION1: "MEDIA SUPERIOR",
    });
    expect(school.level).toBe("media-superior");
    expect(school.sector).toBe("privada");
    expect(school.shift).toBe("completo");
    expect(school.colonia).toBe(null);
    expect(school.lat).toBe(null);
  });

  it("descarta claves que no son CCT", () => {
    expect(mapSepRecord({ cv_cct: "12345" })).toBe(null);
  });
});

import { mount, flushPromises } from "@vue/test-utils";
import { vi, afterEach } from "vitest";
import SchoolPicker from "../src/components/SchoolPicker.vue";

const found = [
  { cct: "02DPR0002B", name: "Benito Juárez", level: "primaria", shift: "matutino", colonia: "Centro", municipality: "Tijuana", registered: false },
  { cct: "02DPR0003C", name: "Benito Juárez", level: "primaria", shift: "vespertino", colonia: "Centro", municipality: "Tijuana", registered: true },
];

describe("Autocompletado de escuelas", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("muestra sugerencias al escribir y elige con flechas y Enter", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ schools: found }) }));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(SchoolPicker, { attachTo: document.body });
    const input = wrapper.find("input[role=combobox]");
    await input.setValue("b");
    vi.advanceTimersByTime(300);
    expect(fetch).not.toHaveBeenCalled();
    await input.setValue("beni");
    vi.advanceTimersByTime(200);
    vi.useRealTimers();
    await flushPromises();
    expect(fetch.mock.calls[0][0]).toBe("/api/catalogo-escuelas?q=beni");
    const options = wrapper.findAll("[role=option]");
    expect(options).toHaveLength(2);
    expect(options[0].find("mark").text()).toBe("Beni");
    expect(options[0].text()).toContain("Matutino");
    expect(options[1].text()).toContain("Ya está registrada");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toMatch(/op-0$/);
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("pick")[0][0].cct).toBe("02DPR0002B");
    wrapper.unmount();
  });
});
