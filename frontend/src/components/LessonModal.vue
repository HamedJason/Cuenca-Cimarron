<script setup>
import { computed, ref, watch } from "vue";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import PacificLab from "./PacificLab.vue";
import PointsTag from "./PointsTag.vue";
import ActivityQuestion from "./ActivityQuestion.vue";
import SecretCoin from "./SecretCoin.vue";
import { earn } from "../composables/useCimacoins";
import { activeLesson, closeLesson, openLesson } from "../composables/useLesson";
import { savedList } from "../composables/storage";
import {
  familyPlan,
  firstAidGroups,
  firstAidRules,
  healthAlarms,
  kitGroups,
  ninoOutlook,
  rainHealth,
  sources,
} from "../data";

// Ventana de los temas de Información. Se monta una vez en App.vue.
// Las marcas usan las mismas llaves que la página anterior para no perder el avance.
const planIds = familyPlan.flatMap((step, s) =>
  step.tasks.map((_, t) => `${s}-${t}`),
);
const kitIds = kitGroups.flatMap((group) => group.items.map((item) => item.id));
const aidIds = firstAidGroups.flatMap((group) => group.items.map((item) => item.id));
const planDone = savedList("cuenca.planfamiliar.checks", planIds);
const kitDone = savedList("cuenca.mochila.checks", kitIds);
const aidDone = savedList("cuenca.botiquin.checks", aidIds);
const toggleAid = (id) => (aidDone.value = toggled(aidDone.value, id));
const aidCount = (group) =>
  group.items.filter((item) => aidDone.value.includes(item.id)).length;
const aidComplete = computed(() => aidDone.value.length === aidIds.length);

// En la plantilla los refs llegan ya desenvueltos, por eso cada lista tiene su función.
const toggled = (list, id) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
const togglePlan = (id) => (planDone.value = toggled(planDone.value, id));
const toggleKit = (id) => (kitDone.value = toggled(kitDone.value, id));
const stepDone = (s) =>
  familyPlan[s].tasks.every((_, t) => planDone.value.includes(`${s}-${t}`));
const groupCount = (group) =>
  group.items.filter((item) => kitDone.value.includes(item.id)).length;
const kitComplete = computed(() => kitDone.value.length === kitIds.length);
const planComplete = computed(() => planDone.value.length === planIds.length);

// Cimacoins por terminar cada lista (se entregan una sola vez)
watch(kitComplete, (done) => done && earn("mochila-lista"), { immediate: true });
watch(planComplete, (done) => done && earn("plan-listo"), { immediate: true });
watch(aidComplete, (done) => done && earn("botiquin-listo"), { immediate: true });

const lesson = activeLesson;
// Cada tema empieza desde arriba: la ventana se regresa al inicio al cerrarla
// y al saltar de un tema a otro (cerrada ya no se puede mover).
const modal = ref(null);
const toTop = () => {
  const dialog = modal.value?.$el;
  if (dialog) dialog.scrollTop = 0;
};
function close() {
  toTop();
  closeLesson();
}
function goTo(id) {
  openLesson(id);
  toTop();
}
</script>
<template>
  <Modal
    ref="modal"
    :open="!!lesson"
    :title="lesson?.title"
    wide
    :class="['lesson-modal', lesson && `tone-${lesson.tone}`]"
    @close="close"
  >
    <template v-if="lesson">
      <div class="lesson-top">
        <img
          class="lesson-top-art"
          :src="lesson.image"
          :alt="lesson.alt"
          width="480"
          height="270"
        />
        <div class="lesson-top-text">
          <PointsTag :activity-key="`lectura-${lesson.id}`" />
          <p class="lesson-intro">{{ lesson.intro }}</p>
          <p>{{ lesson.body }}</p>
          <ul class="lesson-points">
            <li v-for="point in lesson.points" :key="point">
              <Icon name="check" :size="20" /> {{ point }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Qué es El Niño -->
      <template v-if="lesson.id === 'conozca'">
        <section class="lesson-part" aria-labelledby="leccion-pacifico">
          <h3 id="leccion-pacifico">¿Qué cambia en el Pacífico?</h3>
          <PacificLab />
        </section>
        <section class="lesson-part" aria-labelledby="leccion-tijuana">
          <h3 id="leccion-tijuana">¿Qué significa para Tijuana?</h3>
          <p class="lesson-lead">
            El Niño hace más probable que llueva fuerte, pero no dice cuándo ni
            cuánto lloverá en tu colonia. Por eso hay que seguir los avisos
            oficiales
          </p>
          <div class="lesson-cards">
            <article
              v-for="(card, i) in ninoOutlook.cards"
              :key="card.title"
              class="lesson-card-mini"
            >
              <span class="lesson-num" aria-hidden="true">{{ i + 1 }}</span>
              <strong>{{ card.title }}</strong>
              <span>{{ card.text }}</span>
            </article>
          </div>
          <p class="lesson-note">
            {{ ninoOutlook.note }} ·
            <a :href="ninoOutlook.noteHref" target="_blank" rel="noopener"
              >Ver el comunicado</a
            >
          </p>
        </section>
        <section class="lesson-part" aria-labelledby="leccion-fuentes">
          <h3 id="leccion-fuentes">Fuentes oficiales</h3>
          <div class="lesson-links">
            <a
              v-for="link in ninoOutlook.links"
              :key="link.href"
              class="button secondary"
              :href="link.href"
              target="_blank"
              rel="noopener"
              ><Icon name="external" :size="18" /> {{ link.label }}</a
            >
          </div>
        </section>
      </template>

      <!-- Plan familiar -->
      <template v-else-if="lesson.id === 'planfamiliar'">
        <section class="lesson-part" aria-labelledby="leccion-plan">
          <div class="lesson-part-head">
            <div>
              <h3 id="leccion-plan">Cuatro pasos</h3>
              <p class="lesson-lead">
                Marquen lo que ya hicieron. El avance se guarda en este
                navegador
              </p>
            </div>
            <div class="lesson-progress">
              <strong>{{ planDone.length }} / {{ planIds.length }}</strong>
              <progress
                :max="planIds.length"
                :value="planDone.length"
                :aria-label="`${planDone.length} de ${planIds.length} acciones marcadas`"
              ></progress>
            </div>
          </div>
          <ol class="plan-steps">
            <li
              v-for="(step, s) in familyPlan"
              :key="step.title"
              :class="['plan-step', { done: stepDone(s) }]"
            >
              <span class="lesson-num" aria-hidden="true">
                <Icon v-if="stepDone(s)" name="check" :size="22" />
                <template v-else>{{ s + 1 }}</template>
              </span>
              <strong>{{ step.title }}</strong>
              <span class="plan-step-text">{{ step.text }}</span>
              <label
                v-for="(task, t) in step.tasks"
                :key="task"
                class="check-row"
              >
                <input
                  type="checkbox"
                  :checked="planDone.includes(`${s}-${t}`)"
                  @change="togglePlan(`${s}-${t}`)"
                />
                <span>{{ task }}</span>
              </label>
              <p class="plan-step-tip"><Icon name="info" :size="18" /> {{ step.tip }}</p>
            </li>
          </ol>
          <button
            v-if="planDone.length"
            class="text-link lesson-reset"
            type="button"
            @click="planDone = []"
          >
            <Icon name="reset" :size="18" /> Borrar marcas
          </button>
        </section>
        <div class="lesson-links">
          <a class="button secondary" :href="sources.plan" target="_blank" rel="noopener"
            ><Icon name="external" :size="18" /> Guía de CENAPRED</a
          >
          <button class="button primary cta" type="button" @click="goTo('mochila', $event)">
            <Icon name="backpack" :size="20" /> Sigue con tu mochila
          </button>
        </div>
      </template>

      <!-- Mochila -->
      <template v-else-if="lesson.id === 'mochila'">
        <section class="lesson-part" aria-labelledby="leccion-mochila">
          <div class="lesson-part-head">
            <div>
              <h3 id="leccion-mochila">Doce cosas para tener listas</h3>
              <p class="lesson-lead">
                Marca lo que ya tienes. Tu avance se guarda en este navegador
              </p>
            </div>
            <div :class="['lesson-progress', { complete: kitComplete }]">
              <strong>{{ kitDone.length }} / {{ kitIds.length }}</strong>
              <span>{{ kitComplete ? "¡Lista completa!" : "cosas listas" }}</span>
              <progress
                :max="kitIds.length"
                :value="kitDone.length"
                :aria-label="`${kitDone.length} de ${kitIds.length} cosas listas`"
              ></progress>
            </div>
          </div>
          <div class="kit-groups">
            <section
              v-for="group in kitGroups"
              :key="group.title"
              class="kit-group"
            >
              <h4>
                {{ group.title }}
                <span>{{ groupCount(group) }} / {{ group.items.length }}</span>
              </h4>
              <label
                v-for="item in group.items"
                :key="item.id"
                :class="['kit-row', { done: kitDone.includes(item.id) }]"
              >
                <span class="kit-icon" aria-hidden="true"
                  ><Icon :name="item.icon" :size="24"
                /></span>
                <span class="kit-copy"
                  ><strong>{{ item.name }}</strong
                  ><small>{{ item.detail }}</small></span
                >
                <input
                  type="checkbox"
                  :checked="kitDone.includes(item.id)"
                  :aria-label="`Marcar ${item.name} como listo`"
                  @change="toggleKit(item.id)"
                />
              </label>
            </section>
          </div>
          <button
            v-if="kitDone.length"
            class="text-link lesson-reset"
            type="button"
            @click="kitDone = []"
          >
            <Icon name="reset" :size="18" /> Borrar marcas
          </button>
        </section>
        <div class="lesson-links">
          <a class="button secondary" :href="sources.backpack" target="_blank" rel="noopener"
            ><Icon name="external" :size="18" /> Recomendaciones de CENAPRED</a
          >
          <button class="button primary cta" type="button" @click="goTo('salud', $event)">
            <Icon name="medical" :size="20" /> Arma tu botiquín
          </button>
        </div>
      </template>

      <!-- Botiquín y salud -->
      <template v-else-if="lesson.id === 'salud'">
        <section class="lesson-part" aria-labelledby="leccion-botiquin">
          <div class="lesson-part-head">
            <div>
              <h3 id="leccion-botiquin">Tu botiquín de casa</h3>
              <p class="lesson-lead">
                Lo básico según la Secretaría de Salud. Marca lo que ya tienes
              </p>
            </div>
            <div :class="['lesson-progress', { complete: aidComplete }]">
              <strong>{{ aidDone.length }} / {{ aidIds.length }}</strong>
              <span>{{ aidComplete ? "¡Botiquín completo!" : "cosas listas" }}</span>
              <progress
                :max="aidIds.length"
                :value="aidDone.length"
                :aria-label="`${aidDone.length} de ${aidIds.length} cosas del botiquín listas`"
              ></progress>
            </div>
          </div>
          <div class="kit-groups">
            <section
              v-for="group in firstAidGroups"
              :key="group.title"
              class="kit-group"
            >
              <h4>
                {{ group.title }}
                <span>{{ aidCount(group) }} / {{ group.items.length }}</span>
              </h4>
              <label
                v-for="item in group.items"
                :key="item.id"
                :class="['kit-row', { done: aidDone.includes(item.id) }]"
              >
                <span class="kit-icon" aria-hidden="true"
                  ><Icon name="medical" :size="22"
                /></span>
                <span class="kit-copy"
                  ><strong>{{ item.name }}</strong
                  ><small>{{ item.detail }}</small></span
                >
                <input
                  type="checkbox"
                  :checked="aidDone.includes(item.id)"
                  :aria-label="`Marcar ${item.name} como listo`"
                  @change="toggleAid(item.id)"
                />
              </label>
            </section>
          </div>
          <button
            v-if="aidDone.length"
            class="text-link lesson-reset"
            type="button"
            @click="aidDone = []"
          >
            <Icon name="reset" :size="18" /> Borrar marcas
          </button>
        </section>

        <section class="lesson-part" aria-labelledby="leccion-guardar">
          <h3 id="leccion-guardar">Cómo guardarlo</h3>
          <div class="health-rules">
            <article v-for="rule in firstAidRules" :key="rule.title" class="health-rule">
              <span class="health-icon" aria-hidden="true"><Icon :name="rule.icon" :size="24" /></span>
              <strong>{{ rule.title }}</strong>
              <span>{{ rule.text }}</span>
            </article>
          </div>
        </section>

        <section class="lesson-part" aria-labelledby="leccion-lluvia-salud">
          <h3 id="leccion-lluvia-salud">Tu salud con la lluvia</h3>
          <div class="health-tips">
            <article v-for="tip in rainHealth" :key="tip.title" class="health-tip">
              <span class="health-icon" aria-hidden="true"><Icon :name="tip.icon" :size="24" /></span>
              <strong>{{ tip.title }}</strong>
              <span>{{ tip.text }}</span>
            </article>
          </div>
        </section>

        <section class="lesson-part health-alarm" aria-labelledby="leccion-alarma">
          <h3 id="leccion-alarma">No esperes: llama al 911 si…</h3>
          <ul>
            <li v-for="alarm in healthAlarms" :key="alarm">
              <Icon name="phone" :size="18" /> {{ alarm }}
            </li>
          </ul>
          <a class="button primary cta health-call" href="tel:911"
            ><Icon name="phone" :size="20" /> Llamar al 911</a
          >
          <p class="lesson-note">
            No reemplaza la consulta médica. La Cruz Roja da cursos de primeros auxilios
          </p>
        </section>

        <div class="lesson-links">
          <a class="button secondary" :href="sources.firstAid" target="_blank" rel="noopener"
            ><Icon name="external" :size="18" /> Guía de botiquín de la Secretaría de Salud</a
          >
          <a class="button secondary" :href="sources.safeWater" target="_blank" rel="noopener"
            ><Icon name="external" :size="18" /> Cómo desinfectar el agua</a
          >
          <button class="button primary cta" type="button" @click="goTo('mochila', $event)">
            <Icon name="backpack" :size="20" /> Vuelve a tu mochila
          </button>
        </div>
      </template>
      <ActivityQuestion :key="lesson.id" :activity-key="`lectura-${lesson.id}`" />
      <!-- Moneda escondida al final de cada tema -->
      <p class="lesson-coin"><SecretCoin :id="`moneda-${lesson.id}`" /></p>
    </template>
  </Modal>
</template>
