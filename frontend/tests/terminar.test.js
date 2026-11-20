// Cimacoins por terminar cada juego: visitantes (juegos propios y de otros sitios) y alumnos.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ActivityQuestion from "../src/components/ActivityQuestion.vue";
import { student, progress, studentState } from "../src/composables/useStudent";
import { activities } from "../src/composables/useActivities";
import { coins, isClaimed, lastReward, updateWallet } from "../src/composables/useCimacoins";
import { FINISHED_GAMES, claimLocalFinishes, claimStudentFinishes } from "../src/composables/useFinishRewards";
import { siteRewards, OPEN_COINS, FINISH_COINS } from "../src/avatar/rewards.js";

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

describe("Visitante con juegos propios", () => {
  it("cobra una vez cada juego anotado como terminado e ignora claves sin premio", async () => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.setItem(FINISHED_GAMES, JSON.stringify(["memorama", "lectura-conozca", "no-existe"]));
    await claimLocalFinishes();
    expect(coins.value).toBe(80 + FINISH_COINS);
    expect(isClaimed("termino-memorama")).toBe(true);
    await claimLocalFinishes();
    expect(coins.value).toBe(80 + FINISH_COINS);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("lo anotado en el navegador no se cobra en la cuenta de un alumno", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    student.value = { name: "Ana", wallet: { version: 1, extra: 80, perPoint: 5, owned: [], claimed: [], dailyClaims: {}, completed: [], daily: "", angelic: false } };
    localStorage.setItem(FINISHED_GAMES, JSON.stringify(["memorama"]));
    await claimLocalFinishes();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("Visitante con juegos de otros sitios", () => {
  it("contesta bien y gana las Cimacoins sin guardar puntos", async () => {
    const fetch = vi.fn(() => reply({ correct: true }));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "codigo-120", startedAt: Date.now() - 4 * 60 * 1000 } });
    expect(wrapper.text()).toContain(`Pregunta para ganar ${FINISH_COINS} Cimacoins`);
    await wrapper.findAll("input[type=radio]")[1].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/actividades/codigo-120/revisar");
    expect(JSON.parse(options.body)).toEqual({ answer: 1 });
    expect(wrapper.text()).toContain(`Ganaste ${FINISH_COINS} Cimacoins`);
    expect(coins.value).toBe(80 + FINISH_COINS);
    expect(progress.value.points).toBe(0);
  });
  it("si se equivoca no gana nada y puede intentar otra vez", async () => {
    vi.stubGlobal("fetch", vi.fn(() => reply({ correct: false, message: "Esa no es." }, 422)));
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "codigo-120", startedAt: Date.now() - 4 * 60 * 1000 } });
    await wrapper.findAll("input[type=radio]")[0].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Esa no es");
    expect(coins.value).toBe(80);
    expect(wrapper.find("button").exists()).toBe(true);
  });
  it("si regresa antes del tiempo mínimo no pregunta al servidor", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(ActivityQuestion, { props: { activityKey: "codigo-120", startedAt: Date.now() - 30 * 1000 } });
    await wrapper.findAll("input[type=radio]")[1].setValue(true);
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("muy rápido");
    expect(fetch).not.toHaveBeenCalled();
    expect(coins.value).toBe(80);
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
});
