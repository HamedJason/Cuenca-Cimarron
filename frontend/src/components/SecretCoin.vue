<script setup>
// Moneda escondida: da Cimacoins la primera vez que la tocas.
// Ya recogida, se queda como un hueco discreto para que se note que ya pasaste por ahí.
import { computed } from "vue";
import Icon from "./Icon.vue";
import { earn, isClaimed, siteRewards, wallet, earnsCoins } from "../composables/useCimacoins";
const props = defineProps({ id: { type: String, required: true } });
const claimed = computed(() => (wallet.value, isClaimed(props.id)));
</script>
<template>
  <button
    v-if="earnsCoins && siteRewards[id]"
    type="button"
    :class="['secret-coin', { claimed }]"
    :disabled="claimed"
    :aria-label="claimed ? 'Moneda ya recogida' : `Moneda escondida: ${siteRewards[id].coins} Cimacoins`"
    :title="claimed ? 'Ya la recogiste' : '¿Qué es eso?'"
    @click="earn(id)"
  >
    <Icon name="coin" :size="20" />
  </button>
</template>
