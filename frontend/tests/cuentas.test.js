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
