<script setup>
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import { agencies, emergency, helpLines, whoToCall, VIOLET_SQUAD_PHONE } from "../data";

// Directorio: todos los números de emergencia del sitio en un solo lugar.
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
const line = (id) => helpLines.find((item) => item.id === id);
const crisis = [line("075"), line("vida")];
const women = line("mujeres");
// Líneas que no son ya una dependencia del directorio (por ahora la Guardia Nacional, 088)
const shown = new Set(["075", "vida", "mujeres"]);
const otherLines = helpLines.filter(
  (item) => !shown.has(item.id) && !agencies.some((agency) => agency.phones.includes(item.number)),
);
const redCrossLine = emergency.redCrossStations.find((item) => item.id === "cruz-roja-tijuana");
const fireStations = emergency.fireStations.filter((item) => item.phone);
const policeStations = emergency.policeStations.filter((item) => item.phones?.length);
const officialLinks = [
  { label: "Directorio oficial del Ayuntamiento", href: "https://www.tijuana.gob.mx/emergencias/" },
  { label: "Seguridad Pública y denuncia anónima", href: "https://policia.tijuana.gob.mx/contacto.aspx" },
  { label: "Protección Civil Tijuana", href: "https://proteccioncivil.tijuana.gob.mx/" },
  { label: "Bomberos Tijuana", href: "https://bomberos.tijuana.gob.mx/" },
];
</script>

<template>
  <div class="page directory-page">
    <header class="gm-hero dir-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="contacts" :size="20" /> Directorio</span>
        <h1>Números de emergencia</h1>
        <p>Toca un número para llamar</p>
      </div>
      <a class="dir-911 cta" href="tel:911" aria-label="Llamar al 911"
        ><span class="dir-911-ring" aria-hidden="true"><Icon name="phone" :size="44" /></span
        ><span class="dir-911-text"><span>Emergencias</span><strong>911</strong></span></a
      >
    </header>

    <section aria-labelledby="titulo-quien-llamo" class="section-space agencies" id="numeros">
      <div class="gm-section-head">
        <h2 id="titulo-quien-llamo" class="section-title">¿A quién le llamo?</h2>
        <PointsTag />
      </div>
      <ul class="who-list">
        <li v-for="row in whoToCall" :key="row.situation" :class="{ 'is-911': row.number === '911' }">
          <span class="who-situation">{{ row.situation }}</span>
          <a
            class="who-call"
            :href="telHref(row.number)"
            :aria-label="`${row.situation}: llamar a ${row.who}, ${row.number}`"
            ><Icon name="phone" :size="16" />
            <span class="who-number">{{ row.number }}</span>
            <span class="who-name">{{ row.who }}</span></a
          >
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-crisis" class="section-space">
      <h2 id="titulo-crisis" class="section-title">Si te sientes muy mal</h2>
      <div class="dir-big-grid">
        <article v-for="item in crisis" :key="item.id" :class="['dir-big', `agency-${item.theme}`]">
          <span class="agency-icon" aria-hidden="true"><Icon :name="item.icon" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>{{ item.name }}</h3>
            <span v-if="item.note" class="dir-badge">{{ item.note }}</span>
            <p>{{ item.what }}</p>
          </div>
          <a class="dir-big-call" :href="telHref(item.number)" :aria-label="`Llamar a ${item.name}, ${item.number}`"
            ><Icon name="phone" :size="22" /> {{ item.number }}</a
          >
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-violencia" class="section-space">
      <h2 id="titulo-violencia" class="section-title">Si hay violencia en casa</h2>
      <div class="dir-big-grid">
        <article class="dir-big agency-violet">
          <span class="agency-icon" aria-hidden="true"><Icon name="violet" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>Escuadrón Violeta</h3>
            <span class="dir-badge"><Icon name="pin" :size="14" /> Solo funciona en Tijuana</span>
            <p>Policías que ayudan a mujeres, niñas y niños que viven violencia</p>
          </div>
          <a
            class="dir-big-call"
            :href="telHref(VIOLET_SQUAD_PHONE)"
            :aria-label="`Llamar al Escuadrón Violeta, ${VIOLET_SQUAD_PHONE}. Solo funciona en Tijuana`"
            ><Icon name="phone" :size="22" /> {{ VIOLET_SQUAD_PHONE }}</a
          >
        </article>
        <article :class="['dir-big', `agency-${women.theme}`]">
          <span class="agency-icon" aria-hidden="true"><Icon :name="women.icon" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>{{ women.name }}</h3>
            <span class="dir-badge">{{ women.number }} {{ women.note }}</span>
            <p>Orientación y apoyo para mujeres</p>
          </div>
          <a class="dir-big-call" :href="telHref(women.number)" :aria-label="`Llamar a ${women.name}, ${women.number} ${women.note}`"
            ><Icon name="phone" :size="22" /> {{ women.number }}</a
          >
        </article>
      </div>
      <p class="dir-911-note"><Icon name="info" :size="18" /> Si estás en peligro ahora, llama al <a href="tel:911">911</a></p>
    </section>

    <section aria-labelledby="titulo-dependencias" class="section-space agencies">
      <h2 id="titulo-dependencias" class="section-title">Quién te ayuda y en qué</h2>
      <div class="agency-grid directory-grid">
        <article
          v-for="agency in agencies"
          :id="`dependencia-${agency.id}`"
          :key="agency.id"
          :class="['agency-card', `agency-${agency.theme}`]"
        >
          <header class="agency-head">
            <span class="agency-icon" aria-hidden="true"><Icon :name="agency.icon" :size="24" /></span>
            <h3 class="dir-agency-name">{{ agency.name }}</h3>
            <span class="agency-phones">
              <a
                v-for="number in agency.phones"
                :key="number"
                class="agency-call"
                :href="telHref(number)"
                :aria-label="`Llamar a ${agency.name}, ${number}`"
                ><Icon name="phone" :size="16" /> {{ number }}</a
              >
              <a
                v-if="agency.id === 'cruz-roja' && redCrossLine"
                class="agency-call"
                :href="telHref(redCrossLine.phones[1])"
                :aria-label="`Llamar a Cruz Roja Tijuana, ${redCrossLine.phones[1]}`"
                ><Icon name="phone" :size="16" /> {{ redCrossLine.phones[1] }}</a
              >
              <a
                v-if="agency.id === 'cespt'"
                class="agency-call"
                href="https://wa.me/526643701531"
                target="_blank"
                rel="noopener"
                aria-label="Escribir a CESPT por WhatsApp, 664 370 1531"
                ><Icon name="phone" :size="16" /> WhatsApp 664 370 1531</a
              >
            </span>
          </header>
          <details class="agency-more">
            <summary>Cuándo llamarles</summary>
            <p class="agency-what">{{ agency.kid }}</p>
            <a v-if="agency.source" class="agency-source" :href="agency.source" target="_blank" rel="noopener"
              ><Icon name="external" :size="16" /> Sitio oficial</a
            >
          </details>
        </article>
        <article v-for="item in otherLines" :key="item.id" :class="['agency-card', `agency-${item.theme}`]">
          <header class="agency-head">
            <span class="agency-icon" aria-hidden="true"><Icon :name="item.icon" :size="24" /></span>
            <h3 class="dir-agency-name">{{ item.name }}</h3>
            <span class="agency-phones">
              <a class="agency-call" :href="telHref(item.number)" :aria-label="`Llamar a ${item.name}, ${item.number}`"
                ><Icon name="phone" :size="16" /> {{ item.number }}</a
              >
            </span>
          </header>
          <details class="agency-more">
            <summary>Para qué sirve</summary>
            <p class="agency-what">{{ item.kid || item.what }}</p>
          </details>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-estaciones" class="section-space">
      <h2 id="titulo-estaciones" class="section-title">Estaciones cerca de ti</h2>
      <p class="dir-911-note"><Icon name="info" :size="18" /> En una emergencia marca al <a href="tel:911">911</a>. Estos números son para dudas</p>
      <div class="dir-stations">
        <details class="dir-station-list agency-fire">
          <summary><Icon name="flame" :size="22" /> Bomberos, por estación</summary>
          <ul>
            <li v-for="item in fireStations" :key="item.id">
              <span
                ><strong>{{ item.name }}</strong> <small>{{ item.area }}</small></span
              >
              <a class="agency-call" :href="telHref(item.phone)" :aria-label="`Llamar a ${item.name}, ${item.phone}`"
                ><Icon name="phone" :size="16" /> {{ item.phone }}</a
              >
            </li>
          </ul>
        </details>
        <details class="dir-station-list agency-police">
          <summary><Icon name="shield" :size="22" /> Policía, por delegación</summary>
          <ul>
            <li v-for="item in policeStations" :key="item.id">
              <span
                ><strong>{{ item.name }}</strong> <small>{{ item.area }}</small></span
              >
              <span class="agency-phones">
                <a
                  v-for="number in item.phones"
                  :key="number"
                  class="agency-call"
                  :href="telHref(number)"
                  :aria-label="`Llamar a ${item.name}, ${number}`"
                  ><Icon name="phone" :size="16" /> {{ number }}</a
                >
              </span>
            </li>
          </ul>
        </details>
      </div>
    </section>

    <div class="official-links section-space">
      <a
        v-for="link in officialLinks"
        :key="link.href"
        class="button secondary"
        :href="link.href"
        target="_blank"
        rel="noopener"
        ><Icon name="external" :size="18" /> {{ link.label }}</a
      >
    </div>
  </div>
</template>
