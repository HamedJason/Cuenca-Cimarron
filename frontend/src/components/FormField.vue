<script setup>
import { useId } from "vue";
// Etiqueta, control, ayuda y error de un campo. El control va en el slot y recibe el id.
defineProps({ label: String, hint: String, error: String, optional: Boolean });
const id = useId();
</script>
<template>
  <div :class="['field', { 'has-error': error }]">
    <label :for="id"
      >{{ label }}<span v-if="optional" class="field-optional"> (opcional)</span></label
    >
    <slot :id="id" :describedby="`${id}-ayuda`" />
    <p v-if="error" :id="`${id}-ayuda`" class="field-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-ayuda`" class="field-hint">{{ hint }}</p>
  </div>
</template>
