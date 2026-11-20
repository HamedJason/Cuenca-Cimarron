// Cimacoins por terminar cada juego: solo el alumno con sesión las gana. El visitante no.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ActivityQuestion from "../src/components/ActivityQuestion.vue";
import { student, progress, studentState } from "../src/composables/useStudent";
import { activities } from "../src/composables/useActivities";
import { coins, earn, isClaimed, lastReward, updateWallet } from "../src/composables/useCimacoins";
import { FINISHED_GAMES, claimStudentFinishes } from "../src/composables/useFinishRewards";
import { siteRewards, OPEN_COINS, FINISH_COINS, STARTER_COINS } from "../src/avatar/rewards.js";

const reply = (data, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) });

const catalog = [
  { key: "lectura-conozca", title: "Qué es El Niño", kind: "lectura", mode: "pregunta", points: 10, min_minutes: 0, question: { text: "¿Qué es El Niño?", options: ["A", "B", "C"] } },
  { key: "codigo-120", title: "Código 120", kind: "externo", mode: "externo", points: 10, min_minutes: 3, question: { text: "¿Qué haces primero?", options: ["A", "B", "C"] } },
];

beforeEach(() => {
  localStorage.clear();
  updateWallet(() => null);
  activities.value = catalog;
  student.value = null;
  studentState.value = "ready";
  progress.value = { points: 0, completed: [] };
  lastReward.value = null;
  document.cookie = "XSRF-TOKEN=x";
});
afterEach(() => vi.unstubAllGlobals());

describe("Premios por terminar", () => {
  it("cada juego da poco por abrirlo y más por terminarlo", () => {
    const open = Object.keys(siteRewards).filter((id) => id.startsWith("juego-"));
    const finish = Object.keys(siteRewards).filter((id) => id.startsWith("termino-"));
    expect(finish).toHaveLength(open.length);
    for (const id of open) {
      const game = id.slice("juego-".length);
      expect(siteRewards[id].coins).toBe(OPEN_COINS);
      expect(siteRewards[`termino-${game}`]).toMatchObject({ coins: FINISH_COINS, activity: game });
    }
    expect(FINISH_COINS).toBeGreaterThan(OPEN_COINS);
  });
});

describe("Visitante sin sesión", () => {
  it("no gana Cimacoins por terminar juegos ni pide nada al servidor", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    localStorage.setItem(FINISHED_GAMES, JSON.stringify(["memorama", "alto-al-fuego"]));
    await claimStudentFinishes(["memorama", "codigo-120"]);
    expect(await earn("termino-memorama")).toBe(false);
    expect(coins.value).toBe(STARTER_COINS);
    expect(isClaimed("termino-memorama")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("no ve la pregunta de los juegos de otros sitios ni el aviso de Cimacoins", () => {
    const html = mount(ActivityQuestion, { props: { activityKey: "codigo-120" } }).html();
    expect(html).not.toContain("activity-question");
    expect(html).not.toContain("Cimacoins");
  });
  it("las lecturas siguen sin pregunta para visitantes", () => {
    expect(mount(ActivityQuestion, { props: { activityKey: "lectura-conozca" } }).html()).not.toContain("activity-question");
  });
});

describe("Alumno", () => {
  it("pide al servidor el premio de cada actividad completa que lo tenga", async () => {
    const fetch = vi.fn(() => reply({ new: true, wallet: student.value.wallet }));
    vi.stubGlobal("fetch", fetch);
    student.value = { name: "Ana", wallet: { version: 1, extra: 80, perPoint: 5, owned: [], claimed: ["termino-memorama"], dailyClaims: {}, completed: [], daily: "", angelic: false } };
    await claimStudentFinishes(["lectura-conozca", "memorama", "mochila"]);
    const bodies = fetch.mock.calls.map(([url, options]) => [url, JSON.parse(options.body)]);
    expect(bodies).toEqual([["/api/yo/cimacoins/premio", { id: "termino-mochila" }]]);
  });
  it("gana las Cimacoins de terminar un juego que ya tiene completo", async () => {
    const base = { version: 1, extra: STARTER_COINS, perPoint: 10, owned: [], claimed: [], dailyClaims: {}, completed: [], daily: "", angelic: false };
    student.value = { name: "Ana", wallet: base };
    const fetch = vi.fn(() => reply({ new: true, wallet: { ...base, extra: STARTER_COINS + FINISH_COINS, claimed: ["termino-memorama"] } }));
    vi.stubGlobal("fetch", fetch);
    expect(coins.value).toBe(STARTER_COINS);
    await claimStudentFinishes(["memorama"]);
    expect(coins.value).toBe(STARTER_COINS + FINISH_COINS);
    expect(isClaimed("termino-memorama")).toBe(true);
  });
  it("contesta la pregunta del juego de otro sitio y suma puntos", async () => {
    student.value = { name: "Ana", wallet: { version: 1, extra: STARTER_COINS, perPoint: 10, owned: [], claimed: [], dailyClaims: {}, completed: [], daily: "", angelic: false } };
    const fetch = vi.fn(() => reply({ points: 10, total: 10, new: true }));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "codigo-120" } });
    expect(wrapper.text()).toContain("Pregunta para ganar 100 Cimacoins");
    await wrapper.findAll("input[type=radio]")[1].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(fetch.mock.calls[0][0]).toBe("/api/actividades/codigo-120/respuesta");
    expect(wrapper.text()).toContain("Ganaste 100 Cimacoins");
  });
});
