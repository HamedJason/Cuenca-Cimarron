import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog } from "../src/avatar/catalog-export.js";
import { student, progress, studentState } from "../src/composables/useStudent";
import {
  WALLET_KEY,
  buy,
  coins,
  earn,
  isAccountWallet,
  lastReward,
  saveAvatar,
  savedAvatar,
  updateWallet,
  wallet,
} from "../src/composables/useCimacoins";

const reply = (data, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) });
const accountWallet = (extra = {}) => ({
  version: 1,
  coins: 130,
  extra: 80,
  perPoint: 5,
  owned: [],
  claimed: [],
  dailyClaims: {},
  completed: [],
  daily: "",
  angelic: false,
  ...extra,
});

beforeEach(() => {
  localStorage.clear();
  updateWallet(() => null);
  student.value = null;
  studentState.value = "ready";
  progress.value = { points: 0, completed: [] };
  lastReward.value = null;
  document.cookie = "XSRF-TOKEN=x";
});
afterEach(() => vi.unstubAllGlobals());

describe("Catálogo de la API", () => {
  it("backend/config/avatar-catalogo.json está al día con el kit de avatares", () => {
    const saved = JSON.parse(readFileSync(resolve(process.cwd(), "../backend/config/avatar-catalogo.json"), "utf8"));
    // Si falla: cd frontend && node scripts/catalogo-avatar.mjs
    expect(saved).toEqual(JSON.parse(JSON.stringify(buildCatalog())));
  });
});

describe("Cartera del visitante", () => {
  it("se guarda en el navegador y cada premio se da una vez", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(isAccountWallet.value).toBe(false);
    expect(coins.value).toBe(80);
    expect(await earn("moneda-conozca")).toBe(true);
    expect(await earn("moneda-conozca")).toBe(false);
    expect(coins.value).toBe(110);
    expect(JSON.parse(localStorage.getItem(WALLET_KEY)).coins).toBe(110);
    expect(lastReward.value.id).toBe("moneda-conozca");
    expect((await buy({ group: "ojos", id: "alegres" })).ok).toBe(true);
    expect(coins.value).toBe(90);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("Cartera del alumno", () => {
  it("el saldo sube con los puntos sin pedir nada al servidor", () => {
    student.value = { name: "Ana", wallet: accountWallet(), avatar: {} };
    progress.value = { points: 10, completed: [] };
    expect(isAccountWallet.value).toBe(true);
    expect(coins.value).toBe(130);
    progress.value = { points: 20, completed: [] };
    expect(coins.value).toBe(180);
  });

  it("los premios y las compras los valida el servidor", async () => {
    student.value = { name: "Ana", wallet: accountWallet(), avatar: {} };
    const fetch = vi.fn((url) =>
      url.endsWith("/premio")
        ? reply({ new: true, wallet: accountWallet({ extra: 110, claimed: ["moneda-conozca"] }), avatar: {} })
        : reply({ message: "Te faltan Cimacoins", errors: { id: ["Te faltan Cimacoins para comprarlo."] } }, 422),
    );
    vi.stubGlobal("fetch", fetch);
    expect(await earn("moneda-conozca")).toBe(true);
    expect(fetch.mock.calls[0][0]).toBe("/api/yo/cimacoins/premio");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ id: "moneda-conozca" });
    expect(coins.value).toBe(110);
    // Ya reclamado: ni se pregunta al servidor
    expect(await earn("moneda-conozca")).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
    const result = await buy({ group: "pelaje", id: "menta" });
    expect(result).toEqual({ ok: false, message: "Te faltan Cimacoins para comprarlo." });
    // La cartera del navegador no se toca
    expect(localStorage.getItem(WALLET_KEY)).toBeNull();
  });

  it("el avatar se guarda en su cuenta", async () => {
    vi.useFakeTimers();
    student.value = { name: "Ana", wallet: accountWallet(), avatar: { ojos: "redondos" } };
    const fetch = vi.fn(() => reply({ wallet: accountWallet(), avatar: { ojos: "alegres" } }));
    vi.stubGlobal("fetch", fetch);
    expect(savedAvatar()).toEqual({ ojos: "redondos" });
    const saving = saveAvatar({ ojos: "alegres" });
    await vi.runAllTimersAsync();
    expect(await saving).toBe(true);
    vi.useRealTimers();
    await flushPromises();
    expect(fetch.mock.calls[0][0]).toBe("/api/yo/cimarron");
    expect(fetch.mock.calls[0][1].method).toBe("PUT");
    expect(student.value.avatar).toEqual({ ojos: "alegres" });
    expect(wallet.value.perPoint).toBe(5);
  });
});
