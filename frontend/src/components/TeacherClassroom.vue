<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import QrCode from "./QrCode.vue";
import CopyLink from "./CopyLink.vue";
import { api } from "../composables/api";

const ClassroomTasks = defineAsyncComponent(() => import("./ClassroomTasks.vue"));
const tab = ref("alumnos");
const props = defineProps({ classroomId: { type: Number, required: true } });
const emit = defineEmits(["updated"]);
const classroom = ref(null);
const students = ref([]);
const state = ref("loading");
const projecting = ref(false);
const editing = ref({ id: null, name: "", error: "" });
const shownCode = ref(null);

async function load() {
  try {
    const data = await api(`/docente/grupos/${props.classroomId}/alumnos`);
    classroom.value = data.classroom;
    students.value = data.students;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  }
}
onMounted(load);

function setClassroom(data) {
  classroom.value = { ...data.classroom, students: students.value.length };
  emit("updated", classroom.value);
}
async function toggleOpen() {
  setClassroom(await api(`/docente/grupos/${classroom.value.id}`, { method: "PUT", body: { open: !classroom.value.open } }));
}
async function newCode() {
  if (!confirm("¿Cambiar el código? El anterior deja de funcionar. Los alumnos que ya entraron no se ven afectados")) return;
  setClassroom(await api(`/docente/grupos/${classroom.value.id}/codigo`, { method: "POST" }));
}
async function archive() {
  if (!confirm("¿Archivar el grupo? Ya nadie podrá entrar con su código. Los nombres de los alumnos se borran 60 días después")) return;
  setClassroom(await api(`/docente/grupos/${classroom.value.id}/archivar`, { method: "POST" }));
}
async function rename(student) {
  editing.value.error = "";
  try {
    const data = await api(`/docente/alumnos/${student.id}`, { method: "PUT", body: { name: editing.value.name } });
    student.name = data.student.name;
    editing.value = { id: null, name: "", error: "" };
  } catch (e) {
    editing.value.error = e.errors?.name || e.message;
  }
}
async function remove(student) {
  if (!confirm(`¿Borrar a ${student.name}? Se borran su nombre, sus puntos y su avance`)) return;
  await api(`/docente/alumnos/${student.id}`, { method: "DELETE" });
  students.value = students.value.filter((s) => s.id !== student.id);
}
async function resetAccess(student) {
  if (!confirm(`¿Cerrar las sesiones de ${student.name} y darle un código nuevo? Tendrá que entrar otra vez con el código nuevo`)) return;
  const data = await api(`/docente/alumnos/${student.id}/acceso`, { method: "POST" });
  student.return_code = data.return_code;
  shownCode.value = student.id;
}
const returnLink = (code) => `${location.origin}/regresar?codigo=${encodeURIComponent(code)}`;
const printCards = () => window.print();
const host = location.host;
const joinedText = computed(() => `${students.value.length} ${students.value.length === 1 ? "alumno" : "alumnos"}`);
</script>
<template>
  <p v-if="state === 'loading'" class="form-card" role="status">Cargando…</p>
  <p v-else-if="state !== 'ready'" class="form-card form-alert is-error" role="alert">{{ state }}</p>
  <template v-else>
    <section class="form-card classroom-head no-print">
      <div class="panel-head">
        <div>
          <h2 class="form-title">{{ classroom.name }}</h2>
          <p class="muted-text">{{ classroom.grade }} · {{ joinedText }} · Ciclo {{ classroom.school_year }}</p>
        </div>
        <span v-if="classroom.archived" class="status-badge is-rejected">Archivado</span>
        <span v-else :class="['status-badge', classroom.open ? 'is-approved' : 'is-pending']">{{ classroom.open ? "Abierto a alumnos nuevos" : "Cerrado a alumnos nuevos" }}</span>
      </div>
      <div v-if="!classroom.archived" class="join-box">
        <div class="join-code">
          <span class="field-label">Código del grupo</span>
          <span class="classroom-code big">{{ classroom.code }}</span>
          <CopyLink :link="classroom.link" :share-text="`Entra a ${classroom.name} en Cuenca Cimarrona:`" />
        </div>
        <QrCode :text="classroom.link" :size="160" :label="`Código QR para entrar a ${classroom.name}`" />
      </div>
      <div v-if="!classroom.archived" class="form-actions">
        <button class="button primary" type="button" @click="projecting = true"><Icon name="eye" :size="20" />Mostrar en pantalla</button>
        <button class="button secondary" type="button" @click="toggleOpen">{{ classroom.open ? "Cerrar a alumnos nuevos" : "Abrir a alumnos nuevos" }}</button>
        <button class="button secondary" type="button" @click="newCode">Cambiar código</button>
        <button class="button secondary" type="button" @click="archive">Archivar</button>
      </div>
    </section>

    <div class="panel-tabs no-print" role="tablist" aria-label="Secciones del grupo">
      <button v-for="item in [['alumnos', 'Alumnos'], ['tareas', 'Tareas y avance']]" :key="item[0]" role="tab" type="button" :aria-selected="tab === item[0]" :class="['panel-tab', { active: tab === item[0] }]" @click="tab = item[0]">{{ item[1] }}</button>
    </div>

    <ClassroomTasks v-if="tab === 'tareas'" :classroom="classroom" />

    <section v-else class="form-card">
      <div class="panel-head no-print">
        <h2 class="form-title">Alumnos</h2>
        <button v-if="students.length" class="button secondary small-button" type="button" @click="printCards"><Icon name="print" :size="18" />Imprimir tarjetas</button>
      </div>
      <p class="muted-text no-print">Si un alumno cambia de equipo o borra su navegador, dale su código personal. Con él vuelve a entrar en cualquier equipo</p>
      <p v-if="!students.length" class="muted-text">Todavía no entra nadie. Comparte el código del grupo</p>
      <div v-else class="table-wrap no-print">
        <table class="data-table">
          <thead><tr><th>Nombre</th><th>Código personal</th><th><span class="sr-only">Acciones</span></th></tr></thead>
          <tbody>
            <tr v-for="item in students" :key="item.id">
              <td>
                <form v-if="editing.id === item.id" class="inline-edit" @submit.prevent="rename(item)">
                  <input v-model.trim="editing.name" class="code-input" maxlength="30" :aria-label="`Nombre de ${item.name}`" />
                  <button class="button primary small-button" type="submit">Guardar</button>
                  <button class="button secondary small-button" type="button" @click="editing.id = null">Cancelar</button>
                  <p v-if="editing.error" class="field-error" role="alert">{{ editing.error }}</p>
                </form>
                <span v-else>{{ item.name }}</span>
              </td>
              <td>
                <code v-if="shownCode === item.id" class="return-code">{{ item.return_code }}</code>
                <button v-else class="text-link" type="button" @click="shownCode = item.id">Ver código</button>
              </td>
              <td class="row-actions">
                <button class="button secondary small-button" type="button" @click="editing = { id: item.id, name: item.name, error: '' }">Corregir nombre</button>
                <button class="button secondary small-button" type="button" @click="resetAccess(item)">Código nuevo</button>
                <button class="button secondary small-button" type="button" @click="remove(item)">Borrar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="print-cards" aria-hidden="true">
        <div v-for="item in students" :key="item.id" class="print-card">
          <QrCode :text="returnLink(item.return_code)" :size="110" />
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ classroom.name }}</span>
            <span class="print-code">{{ item.return_code }}</span>
            <small>Escanea el QR o entra a {{ host }}/regresar</small>
          </div>
        </div>
      </div>
    </section>

    <Modal :open="projecting" :title="`Entra a ${classroom.name}`" wide @close="projecting = false">
      <div class="project-view">
        <QrCode :text="classroom.link" :size="300" :label="`Código QR para entrar a ${classroom.name}`" />
        <div>
          <p>Escanea el código o entra a</p>
          <p class="project-url">{{ classroom.link.replace(/^https?:\/\//, "").replace(/\/unirse\/\d+$/, "") }}</p>
          <p>y escribe el código</p>
          <p class="classroom-code huge">{{ classroom.code }}</p>
        </div>
      </div>
    </Modal>
  </template>
</template>
