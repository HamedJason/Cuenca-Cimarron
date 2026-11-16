<script setup>
// El alumno arma su cimarrón con las piezas que ya desbloqueó. No se gastan puntos.
import { ref, computed, watch } from "vue";
import Icon from "../components/Icon.vue";
import CimarronAvatar from "../components/CimarronAvatar.vue";
import { api } from "../composables/api";
import { student, progress, studentState, loadStudent } from "../composables/useStudent";

loadStudent();
const backgrounds = [
  { id: "verde", label: "Verde" },
  { id: "ocre", label: "Ocre" },
  { id: "cielo", label: "Cielo" },
];
const pieces = [
  { id: "casco", label: "Casco de protección civil", points: 30 },
  { id: "impermeable", label: "Impermeable", points: 60 },
  { id: "mochila", label: "Mochila de emergencia", points: 100 },
  { id: "linterna", label: "Linterna", points: 150 },
  { id: "insignia", label: "Insignia Guardián de la cuenca", points: 200 },
];
const draft = ref({ background: "verde", pieces: [] });
const state = ref("");
watch(
  () => student.value?.avatar,
  (avatar) => {
    if (avatar) draft.value = { background: avatar.background, pieces: [...avatar.pieces] };
  },
  { immediate: true },
);
const unlocked = (piece) => progress.value.points >= piece.points;
const next = computed(() => pieces.find((p) => !unlocked(p)));
function toggle(piece) {
  if (!unlocked(piece)) return;
  const list = draft.value.pieces;
  draft.value.pieces = list.includes(piece.id) ? list.filter((p) => p !== piece.id) : [...list, piece.id];
  state.value = "";
}
async function save() {
  state.value = "saving";
  try {
    const data = await api("/yo/cimarron", { method: "PUT", body: draft.value });
    student.value = { ...student.value, avatar: data.avatar };
    state.value = "saved";
  } catch (e) {
    state.value = e.errors?.pieces || e.message;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Mi cimarrón</h1>
      <p>Con tus puntos desbloqueas cosas para tu cimarrón</p>
    </header>

    <p v-if="studentState === 'loading' && !student" class="form-card" role="status">Cargando…</p>
    <div v-else-if="!student" class="form-card narrow">
      <p>Para tener tu cimarrón entra con el código de tu grupo</p>
      <RouterLink to="/unirse" class="button primary">Entrar a mi grupo</RouterLink>
    </div>

    <div v-else class="avatar-layout">
      <section class="form-card avatar-preview">
        <CimarronAvatar :avatar="draft" :size="240" :label="`Cimarrón de ${student.name}`" />
        <p class="tasks-points"><Icon name="star" :size="28" /><strong>{{ progress.points }}</strong><span>puntos</span></p>
        <p v-if="next" class="muted-text">Te faltan {{ next.points - progress.points }} puntos para: {{ next.label }}</p>
        <p v-else class="muted-text">Ya desbloqueaste todo</p>
      </section>

      <section class="form-card">
        <fieldset class="form-group">
          <legend>Fondo</legend>
          <div class="choice-row">
            <label v-for="bg in backgrounds" :key="bg.id" class="choice swatch-choice">
              <input v-model="draft.background" type="radio" name="fondo" :value="bg.id" @change="state = ''" />
              <span :class="['swatch', `swatch-${bg.id}`]" aria-hidden="true"></span>{{ bg.label }}
            </label>
          </div>
        </fieldset>
        <fieldset class="form-group">
          <legend>Piezas</legend>
          <ul class="piece-list">
            <li v-for="piece in pieces" :key="piece.id">
              <button
                type="button"
                :class="['piece', { on: draft.pieces.includes(piece.id), locked: !unlocked(piece) }]"
                :aria-pressed="draft.pieces.includes(piece.id)"
                :disabled="!unlocked(piece)"
                @click="toggle(piece)"
              >
                <CimarronAvatar :avatar="{ background: draft.background, pieces: [piece.id] }" :size="64" :label="piece.label" />
                <span>
                  <b>{{ piece.label }}</b>
                  <small v-if="unlocked(piece)">{{ draft.pieces.includes(piece.id) ? "Puesta" : "Toca para ponerla" }}</small>
                  <small v-else>Se desbloquea con {{ piece.points }} puntos</small>
                </span>
              </button>
            </li>
          </ul>
        </fieldset>
        <p v-if="state === 'saved'" class="form-alert is-ok" role="status"><Icon name="check" :size="20" />Guardado</p>
        <p v-else-if="state && state !== 'saving'" class="form-alert is-error" role="alert">{{ state }}</p>
        <button class="button primary" type="button" :disabled="state === 'saving'" @click="save">Guardar mi cimarrón</button>
      </section>
    </div>
  </div>
</template>
