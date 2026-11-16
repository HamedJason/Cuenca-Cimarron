<script setup>
// Cimarrón del alumno, dibujado en SVG con el trazo café de las ilustraciones del sitio.
// Las piezas se desbloquean con puntos (config/avatar.php en la API).
import { computed, useId } from "vue";

const props = defineProps({
  avatar: { type: Object, default: () => ({ background: "verde", pieces: [] }) },
  size: { type: Number, default: 160 },
  label: String,
});
const backgrounds = { verde: "#cfe9d9", ocre: "#ffe1a3", cielo: "#cfe6f7" };
const fill = computed(() => backgrounds[props.avatar?.background] ?? backgrounds.verde);
const has = (piece) => (props.avatar?.pieces ?? []).includes(piece);
const clip = useId();
const line = "#4a2a12";
</script>
<template>
  <svg
    class="cimarron-avatar"
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    role="img"
    :aria-label="label || 'Cimarrón del alumno'"
  >
    <defs>
      <clipPath :id="clip"><circle cx="100" cy="100" r="96" /></clipPath>
    </defs>
    <circle cx="100" cy="100" r="96" :fill="fill" />
    <g :clip-path="`url(#${clip})`" :stroke="line" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <!-- Mochila detrás de la espalda -->
      <g v-if="has('mochila')">
        <rect x="128" y="120" width="46" height="60" rx="12" fill="#e2702a" />
        <rect x="136" y="112" width="30" height="14" rx="6" fill="#c25a1c" />
      </g>
      <!-- Cuerpo: camisa verde o impermeable amarillo -->
      <path d="M28 204C32 156 62 136 100 136s68 20 72 68Z" :fill="has('impermeable') ? '#ffc83d' : '#2e7d4f'" />
      <path v-if="has('impermeable')" d="M76 138l24 26 24-26M100 164v40" fill="none" />
      <path v-else d="M84 138l16 16 16-16" fill="#f6dcb4" />
      <!-- Tirantes de la mochila -->
      <g v-if="has('mochila')" fill="none" stroke-width="3">
        <path d="M70 142 64 204" stroke="#6b3d10" stroke-width="10" />
        <path d="M130 142 136 204" stroke="#6b3d10" stroke-width="10" />
      </g>
      <!-- Insignia "Guardián de la cuenca" -->
      <path
        v-if="has('insignia')"
        d="m72 166 4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3-9.3-4.9-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5Z"
        fill="#dd971a"
      />
      <!-- Cuello y orejas -->
      <rect x="86" y="118" width="28" height="22" fill="#d89a5c" />
      <ellipse cx="62" cy="88" rx="13" ry="8" fill="#e0a96d" transform="rotate(-25 62 88)" />
      <ellipse cx="138" cy="88" rx="13" ry="8" fill="#e0a96d" transform="rotate(25 138 88)" />
      <!-- Cuernos enrollados -->
      <g fill="none">
        <path d="M84 64C70 40 34 42 32 72c-2 26 30 32 36 12 4-12-10-18-16-10" :stroke="line" stroke-width="20" />
        <path d="M116 64c14-24 50-22 52 8 2 26-30 32-36 12-4-12 10-18 16-10" :stroke="line" stroke-width="20" />
        <path d="M84 64C70 40 34 42 32 72c-2 26 30 32 36 12 4-12-10-18-16-10" stroke="#e8b040" stroke-width="14" />
        <path d="M116 64c14-24 50-22 52 8 2 26-30 32-36 12-4-12 10-18 16-10" stroke="#e8b040" stroke-width="14" />
      </g>
      <!-- Cara -->
      <ellipse cx="100" cy="94" rx="33" ry="37" fill="#e0a96d" />
      <ellipse cx="100" cy="114" rx="21" ry="15" fill="#f6dcb4" />
      <ellipse cx="100" cy="105" rx="7" ry="4.5" :fill="line" />
      <path d="M89 117q11 9 22 0" fill="none" />
      <g stroke-width="2.5">
        <ellipse cx="86" cy="88" rx="6.5" ry="7.5" fill="#fff" />
        <ellipse cx="114" cy="88" rx="6.5" ry="7.5" fill="#fff" />
      </g>
      <circle cx="87.5" cy="89.5" r="3.2" :fill="line" stroke="none" />
      <circle cx="115.5" cy="89.5" r="3.2" :fill="line" stroke="none" />
      <path d="M78 76q7-4 13 0M109 76q7-4 13 0" fill="none" stroke-width="2.5" />
      <!-- Casco de protección civil -->
      <g v-if="has('casco')">
        <path d="M66 66c2-30 66-30 68 0Z" fill="#00723f" />
        <path d="M58 66h84q0 7-6 7H64q-6 0-6-7Z" fill="#00723f" />
        <path d="M100 44c-5 6-7 9-7 12a7 7 0 0 0 14 0c0-3-2-6-7-12Z" fill="#fff" stroke-width="2" />
      </g>
      <!-- Linterna con su luz -->
      <g v-if="has('linterna')">
        <path d="M152 160 196 130v56Z" fill="#fff6b0" stroke="none" opacity="0.8" />
        <rect x="118" y="160" width="34" height="14" rx="4" fill="#5a5f63" transform="rotate(-20 135 167)" />
        <rect x="146" y="152" width="12" height="20" rx="3" fill="#ffc83d" transform="rotate(-20 152 162)" />
      </g>
    </g>
    <circle cx="100" cy="100" r="96" fill="none" stroke="#003d24" stroke-width="4" />
  </svg>
</template>
