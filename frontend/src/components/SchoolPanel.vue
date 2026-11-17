<script setup>
import { ref, computed } from "vue";
import Icon from "./Icon.vue";
import SchoolForm from "./SchoolForm.vue";
import MyRecoveryCodes from "./MyRecoveryCodes.vue";
import { api } from "../composables/api";
import { account, setAccount, logout, labelOf, levels, shifts, sectors } from "../composables/useAccount";

defineProps({ isNew: Boolean });
const school = computed(() => account.value.school);
const statusText = {
  pending: "En revisión",
  approved: "Aprobada",
  rejected: "Con cambios pendientes",
  suspended: "Suspendida",
};
const editing = ref(false);
const draft = ref(null);
const errors = ref({});
const saving = ref(false);
const saveMessage = ref("");
function edit() {
  const { status, rejection_reason, id, ...data } = school.value;
  draft.value = { ...data, cct: data.cct ?? "" };
  errors.value = {};
  editing.value = true;
}
async function save() {
  saving.value = true;
  errors.value = {};
  saveMessage.value = "";
  try {
    const data = await api("/escuela", { method: "PUT", body: draft.value });
    setAccount(data.user);
    editing.value = false;
  } catch (error) {
    errors.value = error.errors;
    saveMessage.value = Object.keys(error.errors).length ? "Revisa los campos marcados" : error.message;
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <div class="panel-stack">
    <section class="form-card">
      <div class="panel-head">
        <div>
          <h2 class="form-title">{{ school.name }}</h2>
          <p class="muted-text">{{ labelOf(levels, school.level) }} · {{ labelOf(shifts, school.shift) }} · {{ labelOf(sectors, school.sector) }}</p>
        </div>
        <span :class="['status-badge', `is-${school.status}`]">{{ statusText[school.status] }}</span>
      </div>

      <p v-if="isNew" class="form-alert is-ok" role="status">
        <Icon name="check" :size="20" />Listo, recibimos tu registro
      </p>

      <MyRecoveryCodes />

      <div v-if="school.status === 'pending'" class="note is-gold">
        <Icon name="clock" />
        <p>Estamos revisando los datos de tu escuela. Entra de vez en cuando para ver si ya está aprobada. Mientras tanto no puedes dar de alta docentes</p>
      </div>
      <div v-else-if="school.status === 'suspended'" class="note is-gold">
        <Icon name="info" />
        <p>El acceso de tu escuela está suspendido por este motivo: <b>{{ school.rejection_reason }}</b>. Tus docentes y alumnos no pueden entrar por ahora. Escríbenos a cualquiera de los correos del pie de página</p>
      </div>
      <div v-else-if="school.status === 'rejected'" class="note is-gold">
        <Icon name="info" />
        <p>No pudimos aprobar el registro por este motivo: <b>{{ school.rejection_reason }}</b>. Corrige tus datos y lo volvemos a revisar</p>
      </div>

      <div class="form-actions">
        <button class="button secondary" type="button" @click="edit">Corregir datos</button>
        <button class="button secondary" type="button" @click="logout">Salir</button>
      </div>
    </section>

    <form v-if="editing" class="form-card" novalidate @submit.prevent="save">
      <h2 class="form-title">Datos de la escuela</h2>
      <SchoolForm v-model="draft" :errors="errors" />
      <p v-if="saveMessage" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ saveMessage }}</p>
      <div class="form-actions">
        <button class="button primary" type="submit" :disabled="saving">{{ saving ? "Guardando…" : "Guardar" }}</button>
        <button class="button secondary" type="button" @click="editing = false">Cancelar</button>
      </div>
    </form>

    <slot />
  </div>
</template>
