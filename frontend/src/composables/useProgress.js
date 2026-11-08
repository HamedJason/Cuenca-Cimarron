import { computed } from "vue";
import { savedList, storageAvailable } from "./storage";
import { steps, supplies } from "../data";
export const taskId = (step, i) => `${step.id}-${i}`;
const isDoneStep = (step, done) =>
  step.tasks.every((_, i) => done.includes(taskId(step, i)));
const toggle = (list, id) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export const packed = savedList(
  "cuenca.backpack.v1",
  supplies.map((x) => x.id),
);
export const planTasks = savedList(
  "cuenca.plan.v1",
  steps.flatMap((s) => s.tasks.map((_, i) => taskId(s, i))),
);
export const backpackPercent = computed(() =>
  Math.round((packed.value.length / supplies.length) * 100),
);
export const isStepDone = (step) => isDoneStep(step, planTasks.value);
export const completedSteps = computed(
  () => steps.filter(isStepDone).length,
);
export function togglePacked(id) {
  packed.value = toggle(packed.value, id);
}
export function toggleTask(id) {
  planTasks.value = toggle(planTasks.value, id);
}
export { storageAvailable };
