<script setup>
// Cuentas del equipo: administración completa o solo para ver los datos.
import { ref, reactive, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import CopyLink from "./CopyLink.vue";
import MyRecoveryCodes from "./MyRecoveryCodes.vue";
import { api } from "../composables/api";

const roles = [
  { value: "viewer", label: "Solo ver datos", hint: "Ve el panel de datos y la lista de escuelas. No puede aprobar, cambiar ajustes ni descargar respaldos" },
  { value: "admin", label: "Administración completa", hint: "Puede hacer todo, también invitar y quitar cuentas" },
];
const users = ref([]);
const state = ref("loading");
const form = reactive({ name: "", email: "", role: "viewer" });
const errors = ref({});
const message = ref("");
const busy = ref(false);
const links = ref({});

async function load() {
  try {
    users.value = (await api("/admin/usuarios")).users;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  }
}
onMounted(load);

function rememberLink(id, data) {
  links.value = { ...links.value, [id]: { link: data.link, sent: data.mail_sent } };
}
async function invite() {
  busy.value = true;
  errors.value = {};
  message.value = "";
  try {
    const data = await api("/admin/usuarios", { method: "POST", body: form });
    rememberLink(data.user.id, data);
    Object.assign(form, { name: "", email: "", role: "viewer" });
    await load();
  } catch (e) {
    errors.value = e.errors;
    message.value = Object.keys(e.errors).length ? "" : e.message;
  } finally {
    busy.value = false;
  }
}
async function changeRole(user, role) {
  try {
    await api(`/admin/usuarios/${user.id}`, { method: "PUT", body: { role } });
  } catch (e) {
    alert(e.message);
  }
  await load();
}
async function newLink(user) {
  rememberLink(user.id, await api(`/admin/usuarios/${user.id}/enlace`, { method: "POST" }));
}
async function remove(user) {
  if (!confirm(`¿Quitar el acceso a ${user.name}? Ya no podrá entrar al panel`)) return;
  try {
    await api(`/admin/usuarios/${user.id}`, { method: "DELETE" });
    await load();
  } catch (e) {
    alert(e.message);
  }
}
</script>
<template>
  <section class="form-card" role="tabpanel">
    <h2 class="form-title">Cuentas del equipo</h2>
    <p class="muted-text">Invita a quien necesite ver los datos o ayudar a administrar. Copia su enlace y mándaselo por WhatsApp. Con él pone su contraseña y recibe sus códigos de recuperación</p>
    <p v-if="state === 'loading'" role="status">Cargando…</p>
    <p v-else-if="state !== 'ready'" class="form-alert is-error" role="alert">{{ state }}</p>
    <ul v-else class="review-list">
      <li v-for="user in users" :key="user.id" class="review-item">
        <div class="review-main">
          <h3>{{ user.name }} <span v-if="user.me" class="small muted-text">(tú)</span></h3>
          <p>{{ user.email }}</p>
          <span :class="['status-badge', user.active ? 'is-approved' : 'is-pending']">{{ user.active ? "Activa" : "Invitación pendiente" }}</span>
          <MyRecoveryCodes v-if="user.me" />
          <div v-if="links[user.id]" class="link-share">
            <p class="small">Copia el enlace y mándaselo. Sirve una vez y dura 7 días</p>
            <CopyLink :link="links[user.id].link" :share-text="`Hola ${user.name}, este es tu acceso al panel de Cuenca Cimarrona:`" />
          </div>
        </div>
        <div class="row-actions staff-actions">
          <label class="sr-only" :for="`rol-${user.id}`">Tipo de cuenta de {{ user.name }}</label>
          <select :id="`rol-${user.id}`" class="code-input" :value="user.role" :disabled="user.me" @change="changeRole(user, $event.target.value)">
            <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
          <button v-if="!user.me" class="button secondary small-button" type="button" @click="newLink(user)">{{ user.active ? "Enlace para nueva contraseña" : "Enlace nuevo" }}</button>
          <button v-if="!user.me" class="button secondary small-button" type="button" @click="remove(user)">Quitar acceso</button>
        </div>
      </li>
    </ul>
  </section>

  <form class="form-card" novalidate @submit.prevent="invite">
    <h2 class="form-title">Invitar a alguien</h2>
    <div class="field-row">
      <FormField v-slot="{ id }" label="Nombre" :error="errors.name">
        <input :id="id" v-model.trim="form.name" maxlength="80" autocomplete="off" />
      </FormField>
      <FormField v-slot="{ id }" label="Correo" :error="errors.email">
        <input :id="id" v-model.trim="form.email" type="email" maxlength="160" autocomplete="off" />
      </FormField>
    </div>
    <fieldset class="field choice-list">
      <legend>Tipo de cuenta</legend>
      <label v-for="role in roles" :key="role.value" class="role-choice">
        <input v-model="form.role" type="radio" name="rol-nuevo" :value="role.value" />
        <span><b>{{ role.label }}</b><small>{{ role.hint }}</small></span>
      </label>
    </fieldset>
    <p v-if="message" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
    <div class="form-actions">
      <button class="button primary" type="submit" :disabled="busy || !form.name || !form.email">Mandar invitación</button>
    </div>
  </form>
</template>
