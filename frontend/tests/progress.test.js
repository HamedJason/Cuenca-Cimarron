import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import Backpack from "../src/views/Backpack.vue";
import StepCards from "../src/components/StepCards.vue";
import App from "../src/App.vue";
import {
  packed,
  planTasks,
  completedSteps,
  backpackPercent,
} from "../src/composables/useProgress";
import { readList } from "../src/composables/storage";

beforeEach(async () => {
  packed.value = [];
  planTasks.value = [];
  localStorage.clear();
  sessionStorage.clear();
  await nextTick();
});

describe("Mochila y plan familiar", () => {
  it("marca artículos, actualiza progreso y conserva el avance en almacenamiento", async () => {
    const wrapper = mount(Backpack);
    await wrapper.find("input[type=checkbox]").setValue(true);
    expect(packed.value).toEqual(["agua"]);
    expect(backpackPercent.value).toBe(8);
    expect(JSON.parse(localStorage.getItem("cuenca.backpack.v1"))).toEqual([
      "agua",
    ]);
    wrapper.unmount();
    const reopened = mount(Backpack);
    expect(reopened.find("input[type=checkbox]").element.checked).toBe(true);
    reopened.unmount();
  });
  it("solo borra la mochila después de confirmar y conserva el plan", async () => {
    packed.value = ["agua"];
    planTasks.value = ["riesgos-0"];
    const wrapper = mount(Backpack);
    await wrapper.find(".reset-button").trigger("click");
    await flushPromises();
    expect(wrapper.find("dialog").element.open).toBe(true);
    const cancel = wrapper
      .findAll("button")
      .find((b) => b.text() === "Conservar mi avance");
    await cancel.trigger("click");
    expect(packed.value).toEqual(["agua"]);
    await wrapper.find(".reset-button").trigger("click");
    await flushPromises();
    await wrapper
      .findAll("button")
      .find(
        (b) =>
          b.text() === "Reiniciar lista" && b.classes().includes("primary"),
      )
      .trigger("click");
    expect(packed.value).toEqual([]);
    expect(planTasks.value).toEqual(["riesgos-0"]);
    wrapper.unmount();
  });
  it("permite abrir un paso, completarlo y cerrarlo con Escape", async () => {
    const wrapper = mount(StepCards);
    await wrapper.find(".step-action").trigger("click");
    await flushPromises();
    expect(wrapper.find("dialog").element.open).toBe(true);
    for (const input of wrapper.findAll("input")) await input.setValue(true);
    expect(completedSteps.value).toBe(1);
    expect(wrapper.find(".step-card").text()).toContain("Paso completado");
    await wrapper.find("dialog").trigger("cancel");
    await flushPromises();
    expect(wrapper.find("dialog").element.open).toBe(false);
    wrapper.unmount();
  });
  it("recupera almacenamiento corrupto y descarta entradas desconocidas o repetidas", () => {
    expect(readList("{bad", ["agua"])).toEqual([]);
    expect(readList('{"agua":true}', ["agua"])).toEqual([]);
    expect(readList('["agua","agua","fake",null]', ["agua"])).toEqual(["agua"]);
  });
});

describe("Contador de la comunidad", () => {
  const mountApp = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          component: { template: "<div>Inicio</div>" },
          meta: { title: "Inicio" },
        },
      ],
    });
    await router.push("/");
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
    return wrapper;
  };
  it("muestra únicamente datos de la API y reutiliza identificadores al recargar", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ unique_visitors: 12, total_visits: 20 }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const first = await mountApp();
    expect(first.find(".visits-tag").text()).toContain("12 visitas únicas");
    const firstPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    first.unmount();
    const second = await mountApp();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(firstPayload);
    await second.find(".visits-tag").trigger("click");
    await flushPromises();
    expect(second.find(".metrics").text()).toContain("20");
    second.unmount();
    vi.unstubAllGlobals();
  });
  it("ante un fallo no presenta cifras ficticias y permite reintentar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const wrapper = await mountApp();
    expect(wrapper.find(".visits-tag").text()).toContain(
      "Contador no disponible",
    );
    await wrapper.find(".visits-tag").trigger("click");
    await flushPromises();
    expect(wrapper.find("dialog").text()).toContain(
      "No mostramos cifras estimadas",
    );
    expect(wrapper.find(".metrics").exists()).toBe(false);
    expect(wrapper.find("dialog button.primary").text()).toContain(
      "Volver a intentar",
    );
    wrapper.unmount();
    vi.unstubAllGlobals();
  });
});
