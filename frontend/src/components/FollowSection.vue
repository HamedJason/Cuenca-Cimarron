<script setup>
// "Síguenos": invita a seguir las redes y muestra los videos del proyecto.
// Los videos se cargan solo al tocarlos: antes se ve una portada con botón de play,
// así la página no se vuelve lenta y YouTube o TikTok no rastrean a quien no lo reproduce.
import { ref } from "vue";
import MascotGuide from "./MascotGuide.vue";
import { socials, videos } from "../data";

const liveSocials = socials.filter((social) => social.href);
const playing = ref(null);

const thumb = (video) =>
  video.platform === "youtube"
    ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
    : "";
const embed = (video) =>
  video.platform === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`
    : `https://www.tiktok.com/player/v1/${video.id}?autoplay=1`;
const key = (video) => `${video.platform}-${video.id}`;
</script>
<template>
  <section class="follow" aria-labelledby="titulo-siguenos">
    <div class="follow-card">
      <MascotGuide :size="120" bubble="¡Síguenos!" class="follow-mascot" />
      <div class="follow-text">
        <span class="label">Redes sociales</span>
        <h2 id="titulo-siguenos" class="section-title">Síguenos en redes</h2>
        <p class="section-lead">
          Encuentra avisos y consejos para prepararte, y compártelos con tu
          familia
        </p>
        <div class="follow-buttons">
          <a
            v-for="social in liveSocials"
            :key="social.label"
            :class="['follow-button', `is-${social.label.toLowerCase()}`]"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            ><svg viewBox="0 0 24 24" aria-hidden="true" v-html="social.icon" /><span
              ><strong>{{ social.label }}</strong
              ><small v-if="social.handle">{{ social.handle }}</small></span
            ></a
          >
        </div>
      </div>
    </div>

    <ul v-if="videos.length" class="video-grid" aria-label="Videos">
      <li v-for="video in videos" :key="key(video)" class="video-item">
        <div :class="['video-frame', `is-${video.platform}`]">
          <iframe
            v-if="playing === key(video)"
            :src="embed(video)"
            :title="video.title"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
          <button
            v-else
            class="video-cover"
            type="button"
            :aria-label="`Reproducir: ${video.title}`"
            @click="playing = key(video)"
          >
            <img
              v-if="thumb(video)"
              :src="thumb(video)"
              alt=""
              loading="lazy"
              width="480"
              height="360"
            />
            <span class="video-badge" aria-hidden="true">{{
              video.platform === "youtube" ? "YouTube" : "TikTok"
            }}</span>
            <span class="video-play" aria-hidden="true"
              ><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z" /></svg
            ></span>
          </button>
        </div>
        <p class="video-title">{{ video.title }}</p>
      </li>
    </ul>
    <p v-else class="video-soon">
      <span class="video-soon-icon" aria-hidden="true"
        ><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z" /></svg
      ></span>
      Muy pronto, videos aquí
    </p>
  </section>
</template>
