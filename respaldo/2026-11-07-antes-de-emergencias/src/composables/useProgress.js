import { computed } from "vue";
import { savedList, storageAvailable } from "./storage";
import { steps, supplies } from "../data";
export const packed = savedList(
  "cuenca.backpack.v1",
  supplies.map((x) => x.id),
);
export const planTasks = savedList(
  "cuenca.plan.v1",
  steps.flatMap((s) => s.tasks.map((_, i) => `${s.id}-${i}`)),
);
export const backpackPercent = computed(() =>
  Math.round((packed.value.length / supplies.length) * 100),
);
export const completedSteps = computed(
  () =>
    steps.filter((s) =>
      s.tasks.every((_, i) => planTasks.value.includes(`${s.id}-${i}`)),
    ).length,
);
export function togglePacked(id) {
  packed.value = packed.value.includes(id)
    ? packed.value.filter((x) => x !== id)
    : [...packed.value, id];
}
export function toggleTask(id) {
  planTasks.value = planTasks.value.includes(id)
    ? planTasks.value.filter((x) => x !== id)
    : [...planTasks.value, id];
}
export { storageAvailable };
