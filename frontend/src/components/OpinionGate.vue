<script setup>
// Ventana obligatoria al terminar una actividad: primero la opinión y después el resultado.
// No tiene botón de cerrar ni se cierra con Esc. Si opinó en la última hora no sale (useOpinion.js).
import { ref, watch, nextTick } from "vue";
import OpinionForm from "./OpinionForm.vue";
import { gate, releaseGate } from "../composables/useOpinion";

const dialog = ref(null);
watch(
  () => Boolean(gate.value),
  async (open) => {
    await nextTick();
    if (!dialog.value) return;
    if (open && !dialog.value.open) {
      // Si hay otra ventana abierta (un tema, un juego externo) esta queda encima.
      dialog.value.showModal();
      dialog.value.scrollTop = 0;
    } else if (!open && dialog.value.open) {
      dialog.value.close();
    }
  },
  { immediate: true },
);
</script>
<template>
  <dialog ref="dialog" class="modal opinion-gate" aria-labelledby="opinion-gate-title" @cancel.prevent>
    <div v-if="gate" class="modal-body">
      <div class="opinion-gate-head">
        <img src="/brand/cuenca/mascota-240.webp" alt="" width="88" height="86" />
        <div>
          <h2 id="opinion-gate-title">¡Terminaste!</h2>
          <p class="modal-intro">Antes de seguir, cuéntanos qué te pareció</p>
        </div>
      </div>
      <OpinionForm origin="actividad" required submit-label="Mandar y seguir" @sent="releaseGate" />
    </div>
  </dialog>
</template>
