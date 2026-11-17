<script setup>
// Detalle de una escuela para ayudarla: docentes, grupos, enlaces nuevos, correo y suspensión.
import { ref, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import CopyLink from "./CopyLink.vue";
import RecoveryCodes from "./RecoveryCodes.vue";
import { api } from "../composables/api";

const props = defineProps({ schoolId: { type: Number, required: true } });
const emit = defineEmits(["changed"]);
const data = ref(null);
const error = ref("");
const links = ref({});
const resetLink = ref(null);
const newCodes = ref(null);
async function generateCodes() {
  if (!confirm("¿Generar códigos nuevos para esta escuela? Los anteriores dejan de servir")) return;
  newCodes.value = (await api(`/admin/escuelas/${props.schoolId}/codigos`, { method: "POST" })).recovery_codes;
}
const email = ref("");
const reason = ref("");
const message = ref("");

async function load() {
  try {
    data.value = await api(`/admin/escuelas/${props.schoolId}`);
    email.value = data.value.school.email;
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);

async function teacherLink(teacher) {
  try {
    const r = await api(`/admin/docentes/${teacher.id}/enlace`, { method: "POST" });
    links.value = { ...links.value, [teacher.id]: r.link };
  } catch (e) {
    alert(e.message);
  }
}
async function passwordLink() {
  resetLink.value = await api(`/admin/escuelas/${props.schoolId}/contrasena`, { method: "POST" });
}
async function saveEmail() {
  message.value = "";
  try {
    await api(`/admin/escuelas/${props.schoolId}/correo`, { method: "PUT", body: { email: email.value } });
    message.value = "Correo cambiado. La escuela tiene que volver a entrar con el correo nuevo";
    await load();
  } catch (e) {
    message.value = e.errors?.email || e.message;
  }
}
async function setStatus(action) {
  message.value = "";
  try {
    await api(`/admin/escuelas/${props.schoolId}/${action}`, { method: "POST", body: action === "suspender" ? { reason: reason.value } : {} });
    reason.value = "";
    await load();
    emit("changed");
  } catch (e) {
    message.value = e.errors?.reason || e.message;
  }
}
</script>
<template>
  <div class="school-detail">
    <p v-if="error" class="form-alert is-error" role="alert">{{ error }}</p>
    <p v-else-if="!data" role="status">Cargando…</p>
    <template v-else>
      <h4>Docentes</h4>
      <p v-if="!data.teachers.length" class="small muted-text">Todavía no da de alta docentes</p>
      <ul v-else class="plain-list">
        <li v-for="t in data.teachers" :key="t.id" class="detail-row">
          <span><b>{{ t.name }}</b> <span class="small muted-text">· {{ t.classrooms }} grupos · {{ t.students }} alumnos{{ t.active ? "" : " · dado de baja" }}</span></span>
          <button v-if="t.active" class="text-link" type="button" @click="teacherLink(t)">Enlace nuevo</button>
          <CopyLink v-if="links[t.id]" :link="links[t.id]" :share-text="`Hola ${t.name}, este es tu acceso nuevo a Cuenca Cimarrona:`" />
        </li>
      </ul>

      <h4>Grupos</h4>
      <p v-if="!data.classrooms.length" class="small muted-text">Sin grupos</p>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Grupo</th><th>Docente</th><th>Código</th><th class="num">Alumnos</th></tr></thead>
          <tbody>
            <tr v-for="c in data.classrooms" :key="c.id">
              <td>{{ c.name }} <span class="small muted-text">{{ c.grade }} · {{ c.school_year }}</span></td>
              <td>{{ c.teacher }}</td>
              <td>{{ c.archived ? "Archivado" : c.code }}</td>
              <td class="num">{{ c.students }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Cuenta de la escuela</h4>
      <div class="detail-actions">
        <form class="inline-form" @submit.prevent="saveEmail">
          <FormField v-slot="{ id }" label="Correo de la cuenta">
            <input :id="id" v-model.trim="email" type="email" maxlength="160" />
          </FormField>
          <button class="button secondary small-button" type="submit" :disabled="email === data.school.email">Cambiar correo</button>
        </form>
        <p class="small muted-text">Si la escuela perdió su contraseña y sus códigos de recuperación:</p>
        <div class="form-actions">
          <button class="button secondary small-button" type="button" @click="passwordLink"><Icon name="copy" :size="18" />Enlace para nueva contraseña</button>
          <button class="button secondary small-button" type="button" @click="generateCodes"><Icon name="shield" :size="18" />Códigos de recuperación nuevos</button>
        </div>
        <RecoveryCodes v-if="newCodes" :codes="newCodes" :email="data.school.email" for-other continue-label="Listo" @done="newCodes = null" />
        <div v-if="resetLink" class="link-share">
          <p class="small">Copia el enlace y mándaselo a la escuela. Sirve una vez y dura 24 horas</p>
          <CopyLink :link="resetLink.link" share-text="Este es el enlace para poner tu contraseña nueva de Cuenca Cimarrona:" />
        </div>
      </div>

      <h4>Acceso</h4>
      <div v-if="data.school.status === 'suspended'" class="detail-actions">
        <p class="small">Suspendida. Motivo: {{ data.school.rejection_reason }}</p>
        <button class="button primary small-button" type="button" @click="setStatus('reactivar')">Reactivar escuela</button>
      </div>
      <form v-else-if="data.school.status === 'approved'" class="inline-form" @submit.prevent="setStatus('suspender')">
        <FormField v-slot="{ id, describedby }" label="Motivo para suspender" hint="Mientras esté suspendida, sus docentes y alumnos no pueden entrar. No se borra nada">
          <input :id="id" v-model.trim="reason" maxlength="300" :aria-describedby="describedby" />
        </FormField>
        <button class="button secondary small-button" type="submit" :disabled="reason.length < 5">Suspender</button>
      </form>
      <p v-if="message" class="small" role="status">{{ message }}</p>
    </template>
  </div>
</template>
