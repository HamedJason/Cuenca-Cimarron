import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "../src/composables/api";

function respond(status, body) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

describe("api", () => {
  it("manda la cookie XSRF como encabezado en peticiones que cambian algo", async () => {
    document.cookie = "XSRF-TOKEN=abc%3D123";
    const fetch = vi.fn(() => respond(200, { ok: true }));
    vi.stubGlobal("fetch", fetch);
    await api("/entrar", { method: "POST", body: { email: "a@b.mx" } });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/entrar");
    expect(options.headers["X-XSRF-TOKEN"]).toBe("abc=123");
    expect(options.credentials).toBe("same-origin");
    expect(JSON.parse(options.body)).toEqual({ email: "a@b.mx" });
  });

  it("convierte los errores de validación en un mensaje por campo", async () => {
    document.cookie = "XSRF-TOKEN=x";
    vi.stubGlobal("fetch", vi.fn(() => respond(422, { message: "Datos inválidos", errors: { email: ["Escribe un correo válido."] } })));
    const error = await api("/entrar", { method: "POST", body: {} }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.errors.email).toBe("Escribe un correo válido.");
  });

  it("avisa cuando no hay conexión", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
    const error = await api("/sesion").catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/conexión/);
  });
});

import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import StudentCheck from "../src/components/StudentCheck.vue";
import { student } from "../src/composables/useStudent";

describe("Equipo compartido", () => {
  async function mountCheck() {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:p(.*)*", component: { template: "<div />" } }] });
    await router.push("/");
    return { wrapper: mount(StudentCheck, { global: { plugins: [router] }, attachTo: document.body }), router };
  }

  it("pregunta si es el alumno guardado y no vuelve a preguntar al decir que sí", async () => {
    sessionStorage.clear();
    student.value = { name: "Ana", classroom: "4° B", teacher: "Laura" };
    const { wrapper } = await mountCheck();
    await flushPromises();
    expect(wrapper.find("dialog").element.open).toBe(true);
    expect(wrapper.text()).toContain("¿Eres Ana?");
    await wrapper.findAll("button").find((b) => b.text() === "Sí, soy yo").trigger("click");
    expect(sessionStorage.getItem("cuenca.soy-yo")).toBe("1");
    wrapper.unmount();
    const again = await mountCheck();
    await flushPromises();
    expect(again.wrapper.find("dialog").element.open).toBe(false);
    again.wrapper.unmount();
  });

  it("No soy yo cierra la sesión en este equipo y lleva a entrar", async () => {
    sessionStorage.clear();
    document.cookie = "XSRF-TOKEN=x";
    const fetch = vi.fn(() => respond(200, { ok: true }));
    vi.stubGlobal("fetch", fetch);
    student.value = { name: "Ana", classroom: "4° B", teacher: "Laura" };
    const { wrapper, router } = await mountCheck();
    await flushPromises();
    await wrapper.findAll("button").find((b) => b.text() === "No soy yo").trigger("click");
    await flushPromises();
    expect(fetch.mock.calls.some(([url]) => url === "/api/yo/salir")).toBe(true);
    expect(student.value).toBe(null);
    expect(router.currentRoute.value.path).toBe("/unirse");
    wrapper.unmount();
  });
});

import RecoveryCodes from "../src/components/RecoveryCodes.vue";

describe("Códigos de recuperación", () => {
  it("no deja continuar hasta guardarlos y marcar que se guardaron", async () => {
    URL.createObjectURL = vi.fn(() => "blob:codigos");
    URL.revokeObjectURL = vi.fn();
    const codes = ["ABCD-EFGH", "JKLM-NPQR"];
    const wrapper = mount(RecoveryCodes, { props: { codes, email: "escuela@prueba.mx" } });
    expect(wrapper.text()).toContain("ABCD-EFGH");
    expect(wrapper.text()).toContain("El sitio no manda correos");
    const next = () => wrapper.findAll("button").find((b) => b.text().includes("continuar"));
    expect(next().attributes("disabled")).toBeDefined();
    await wrapper.find("input[type=checkbox]").setValue(true);
    expect(next().attributes("disabled")).toBeDefined();
    await wrapper.findAll("button").find((b) => b.text().includes("Descargar")).trigger("click");
    expect(next().attributes("disabled")).toBeUndefined();
    await next().trigger("click");
    expect(wrapper.emitted("done")).toHaveLength(1);
  });
});
