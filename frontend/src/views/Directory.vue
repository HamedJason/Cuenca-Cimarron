<script setup>
import { computed } from "vue";
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import { agencies, emergency, helpLines, whoToCall, VIOLET_LINE } from "../data";
import { esTijuana, estacionesDe, llamadas, telefono } from "../municipios";
import { municipioActual as muni } from "../composables/useMunicipio";

// Directorio: todos los números de emergencia del sitio en un solo lugar.
// Los números locales salen del municipio elegido, cada uno con su tipo (oficina, ambulancia, citas).
// Si todavía no lo tenemos, se muestra el 911 con un aviso.
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
const waHref = (number) => `https://wa.me/52${number.replace(/\s/g, "")}`;
const line = (id) => helpLines.find((item) => item.id === id);
const tijuana = computed(() => esTijuana(muni.value));
// El 075 es estatal: sale en todos los municipios
const crisis = [line("075"), line("vida")];
// Apoyo psicológico con cita (DIF o instituto de la mujer). No es línea de crisis
const support = computed(() => {
  const found = telefono(muni.value, "psicologico");
  return found.falta ? null : { ...found, calls: llamadas(found) };
});
const women = line("mujeres");
// Líneas que no son ya una dependencia del directorio (por ahora la Guardia Nacional, 088)
const shown = new Set(["075", "vida", "mujeres"]);
const otherLines = helpLines.filter(
  (item) => !shown.has(item.id) && !agencies.some((agency) => agency.phones.includes(item.number)),
);
const violet = computed(() => telefono(muni.value, "violeta"));
// Oficinas y centros de atención a mujeres del municipio, cada número con su tipo
const womenOffices = computed(() => (muni.value.mujeres ?? []).map((item) => ({ ...item, calls: llamadas(item) })));
// Dependencias locales: id en data.js -> [clave en municipios.js, nombre fuera de Tijuana]
const localAgencies = {
  "proteccion-civil": ["proteccionCivil", (m) => `Protección Civil ${m.nombre}`],
  bomberos: ["bomberos", (m) => `Bomberos ${m.nombre}`],
  policia: ["policia", () => "Policía municipal"],
  "cruz-roja": ["cruzRoja", (m) => `Cruz Roja ${m.nombre}`],
  cespt: ["agua", () => "Agua y drenaje"],
};
const agencyList = computed(() =>
  agencies
    .map((agency) => {
      const local = localAgencies[agency.id];
      if (!local) return { ...agency, calls: agency.phones.map((numero) => ({ numero, tipo: "" })) };
      const found = telefono(muni.value, local[0]);
      // Una fuga no se reporta al 911: sin el número del municipio, la tarjeta del agua no sale
      if (agency.id === "cespt" && found.falta) return null;
      // Si Protección Civil y Bomberos comparten oficina, sale una sola tarjeta
      if (agency.id === "bomberos" && found.conjunto) return null;
      // La ambulancia se pide al 911 y la Cruz Roja local tiene además sus propias líneas
      const redCross = agency.id === "cruz-roja";
      const base = tijuana.value ? agency.name : local[1](muni.value);
      return {
        ...agency,
        name: tijuana.value
          ? base
          : found.conjunto
            ? `${found.nombre} ${muni.value.nombre}`
            : agency.id === "cespt"
              ? `Agua y drenaje, ${found.nombre}`
              : (found.nombre ?? base),
        calls: [
          ...(redCross || found.falta ? [{ numero: "911", tipo: redCross ? "Ambulancia" : "" }] : []),
          ...llamadas(found),
        ],
        missing: !redCross && found.falta ? found.aviso : "",
        detail: found.detalle ?? "",
        office: !found.falta,
        source: tijuana.value ? agency.source : found.fuente,
        whatsapp: found.whatsapp,
      };
    })
    .filter(Boolean),
);
const rows = computed(() =>
  whoToCall
    .map((row) => {
      if (row.who === "Protección Civil") {
        const found = telefono(muni.value, "proteccionCivil");
        return found.falta
          ? { ...row, number: "911", who: "Emergencias", missing: found.aviso }
          : { ...row, number: found.numeros[0] };
      }
      if (row.who === "CESPT") {
        const found = telefono(muni.value, "agua");
        return found.falta ? null : { ...row, number: found.numeros[0], who: found.nombre };
      }
      return row;
    })
    .filter(Boolean),
);
const fireStations = computed(() => estacionesDe(muni.value, emergency.fireStations).filter((item) => item.phone));
const policeStations = computed(() =>
  estacionesDe(muni.value, emergency.policeStations).filter((item) => item.phones?.length),
);
const officialLinks = computed(() => muni.value.enlaces);
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
        <li v-for="row in rows" :key="row.situation" :class="{ 'is-911': row.number === '911' }">
          <span class="who-situation"
            >{{ row.situation }}<small v-if="row.missing" class="muni-missing">{{ row.missing }}</small></span
          >
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
            <small v-if="item.missing" class="muni-missing">{{ item.missing }}</small>
          </div>
          <a class="dir-big-call" :href="telHref(item.number)" :aria-label="`Llamar a ${item.name}, ${item.number}`"
            ><Icon name="phone" :size="22" /> {{ item.number }}</a
          >
        </article>
        <article v-if="support" class="dir-big agency-violet">
          <span class="agency-icon" aria-hidden="true"><Icon name="heart" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>Apoyo psicológico (citas)</h3>
            <span class="dir-badge">{{ support.nombre }}</span>
            <p>{{ support.detalle || "Para pedir una cita" }}. No es línea de crisis</p>
          </div>
          <div class="dir-big-calls">
            <a
              v-for="call in support.calls"
              :key="call.numero"
              class="dir-big-call"
              :href="telHref(call.numero)"
              :aria-label="`Llamar a ${support.nombre}, ${call.numero}, ${call.tipo}`"
              ><Icon name="phone" :size="22" /> {{ call.numero }}</a
            >
            <a
              v-if="support.whatsapp"
              class="agency-call"
              :href="waHref(support.whatsapp)"
              target="_blank"
              rel="noopener"
              :aria-label="`Escribir a ${support.nombre} por WhatsApp, ${support.whatsapp}`"
              >WhatsApp {{ support.whatsapp }}</a
            >
          </div>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-violencia" class="section-space">
      <h2 id="titulo-violencia" class="section-title">Si hay violencia en casa</h2>
      <div class="dir-big-grid">
        <article v-if="!violet.falta" class="dir-big agency-violet">
          <span class="agency-icon" aria-hidden="true"><Icon name="violet" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>Escuadrón Violeta</h3>
            <span class="dir-badge"><Icon name="pin" :size="14" /> Solo funciona en Tijuana</span>
            <p>Policías que ayudan a mujeres, niñas y niños que viven violencia</p>
          </div>
          <a
            class="dir-big-call"
            :href="telHref(violet.numeros[0])"
            :aria-label="`Llamar al Escuadrón Violeta, ${violet.numeros[0]}. Solo funciona en Tijuana`"
            ><Icon name="phone" :size="22" /> {{ violet.numeros[0] }}</a
          >
        </article>
        <article v-for="office in womenOffices" :key="office.nombre" class="dir-big agency-violet">
          <span class="agency-icon" aria-hidden="true"><Icon name="violet" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>{{ office.nombre }}</h3>
            <span class="dir-badge"><Icon name="pin" :size="14" /> {{ muni.nombre }}</span>
            <p>{{ office.detalle ? `${office.detalle}. ` : "" }}En emergencia llama al 911</p>
          </div>
          <div class="dir-big-calls">
            <a
              v-for="call in office.calls"
              :key="call.numero"
              class="dir-big-call"
              :href="telHref(call.numero)"
              :aria-label="`Llamar a ${office.nombre}, ${call.numero}, ${call.tipo}`"
              ><Icon name="phone" :size="22" /> {{ call.numero }}<small class="call-type">{{ call.tipo }}</small></a
            >
            <a
              v-if="office.whatsapp"
              class="agency-call"
              :href="waHref(office.whatsapp)"
              target="_blank"
              rel="noopener"
              :aria-label="`Escribir a ${office.nombre} por WhatsApp, ${office.whatsapp}`"
              >WhatsApp {{ office.whatsapp }}</a
            >
          </div>
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
        <article class="dir-big agency-violet">
          <span class="agency-icon" aria-hidden="true"><Icon name="violet" :size="28" /></span>
          <div class="dir-big-copy">
            <h3>Línea Violeta</h3>
            <span class="dir-badge">Estatal, {{ VIOLET_LINE.hours }}</span>
            <p>Violencia de género. Marca y pide la extensión {{ VIOLET_LINE.ext }}</p>
          </div>
          <a
            class="dir-big-call"
            :href="telHref(VIOLET_LINE.number)"
            :aria-label="`Llamar a la Línea Violeta, ${VIOLET_LINE.number}, extensión ${VIOLET_LINE.ext}`"
            ><Icon name="phone" :size="22" /> {{ VIOLET_LINE.number }}<small class="call-type">ext. {{ VIOLET_LINE.ext }}</small></a
          >
        </article>
      </div>
      <p class="dir-911-note"><Icon name="info" :size="18" /> Si estás en peligro ahora, llama al <a href="tel:911">911</a></p>
    </section>

    <section aria-labelledby="titulo-dependencias" class="section-space agencies">
      <h2 id="titulo-dependencias" class="section-title">Quién te ayuda y en qué</h2>
      <div class="agency-grid directory-grid">
        <article
          v-for="agency in agencyList"
          :id="`dependencia-${agency.id}`"
          :key="agency.id"
          :class="['agency-card', `agency-${agency.theme}`]"
        >
          <header class="agency-head">
            <span class="agency-icon" aria-hidden="true"><Icon :name="agency.icon" :size="24" /></span>
            <h3 class="dir-agency-name">{{ agency.name }}</h3>
            <span class="agency-phones">
              <a
                v-for="call in agency.calls"
                :key="call.numero"
                class="agency-call"
                :href="telHref(call.numero)"
                :aria-label="`Llamar a ${agency.name}, ${call.numero}${call.tipo ? `, ${call.tipo}` : ''}`"
                ><Icon name="phone" :size="16" /> {{ call.numero
                }}<small v-if="call.tipo" class="call-type">{{ call.tipo }}</small></a
              >
              <a
                v-if="agency.whatsapp"
                class="agency-call"
                :href="waHref(agency.whatsapp)"
                target="_blank"
                rel="noopener"
                :aria-label="`Escribir a ${agency.name} por WhatsApp, ${agency.whatsapp}`"
                ><Icon name="phone" :size="16" /> WhatsApp {{ agency.whatsapp }}</a
              >
            </span>
            <small v-if="agency.missing" class="muni-missing">{{ agency.missing }}</small>
            <small v-else-if="agency.office" class="muni-missing"
              >{{ agency.detail ? `${agency.detail}. ` : "" }}En emergencia llama al 911</small
            >
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
      <p v-if="!fireStations.length && !policeStations.length" class="dir-911-note">
        <Icon name="info" :size="18" /> Aún no tenemos los teléfonos de las estaciones de {{ muni.nombre }}, en
        emergencia llama al <a href="tel:911">911</a>
      </p>
      <div v-else class="dir-stations">
        <details v-if="fireStations.length" class="dir-station-list agency-fire">
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
        <details v-if="policeStations.length" class="dir-station-list agency-police">
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

    <div v-if="officialLinks.length" class="official-links section-space">
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
