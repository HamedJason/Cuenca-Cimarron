<script setup>
// Una escuela en la lista del panel: datos, ver en el mapa y el detalle para ayudarla.
import { defineAsyncComponent, ref } from "vue";
import { labelOf, levels, shifts, sectors } from "../composables/useAccount";

const AdminSchoolDetail = defineAsyncComponent(() => import("./AdminSchoolDetail.vue"));
defineProps({ school: { type: Object, required: true }, isAdmin: Boolean });
const emit = defineEmits(["map", "changed"]);
const open = ref(false);
</script>

<template>
  <li class="review-item">
    <div class="review-main">
      <h3>{{ school.name }}</h3>
      <p>{{ labelOf(levels, school.level) }} · {{ labelOf(shifts, school.shift) }} · {{ labelOf(sectors, school.sector) }}</p>
      <p>{{ school.address }}, {{ school.colonia }}<template v-if="school.municipality">, {{ school.municipality }}</template></p>
      <p>CCT: <b>{{ school.cct || "sin CCT" }}</b> · {{ school.contact_name }} · {{ school.email }}</p>
      <p v-if="school.lat"><button class="text-link" type="button" @click="emit('map', school)">Ver en el mapa</button></p>
      <p v-if="school.status === 'suspended' && school.rejection_reason" class="small">Motivo de la suspensión: {{ school.rejection_reason }}</p>
    </div>
    <button v-if="isAdmin" class="button secondary" type="button" :aria-expanded="open" @click="open = !open">{{ open ? "Cerrar" : "Ver detalle" }}</button>
    <AdminSchoolDetail v-if="isAdmin && open" :school-id="school.id" class="review-detail" @changed="emit('changed')" />
  </li>
</template>
