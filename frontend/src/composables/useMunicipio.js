// Municipio de Baja California con el que se muestra el sitio.
// Se guarda en este navegador. Sin municipio guardado el sitio se muestra como Tijuana.
// Para probar: ?municipio=mexicali (o cualquier id de municipios.js) lo fija al cargar.
import { computed, ref } from "vue";
import { buscarMunicipio, municipioPorDefecto } from "../municipios";

export const MUNICIPIO_KEY = "cuenca.municipio";

function leer() {
  try {
    return buscarMunicipio(localStorage.getItem(MUNICIPIO_KEY))?.id ?? null;
  } catch {
    return null;
  }
}

// id del municipio elegido, o null si nadie lo ha elegido
export const municipio = ref(leer());
export const municipioActual = computed(() => buscarMunicipio(municipio.value) ?? municipioPorDefecto());

// Regresa el municipio fijado, o null si el valor no es de Baja California
export function fijarMunicipio(valor) {
  const found = buscarMunicipio(valor);
  if (!found) return null;
  municipio.value = found.id;
  try {
    localStorage.setItem(MUNICIPIO_KEY, found.id);
  } catch {
    // Sin almacenamiento dura hasta recargar
  }
  return found;
}

export function borrarMunicipio() {
  municipio.value = null;
  try {
    localStorage.removeItem(MUNICIPIO_KEY);
  } catch {
    // Sin almacenamiento no hay nada que borrar
  }
}

// ?municipio=... en la dirección
export function municipioDeUrl(search = typeof window !== "undefined" ? window.location.search : "") {
  const valor = new URLSearchParams(search).get("municipio");
  return valor ? fijarMunicipio(valor) : null;
}
municipioDeUrl();

export function useMunicipio() {
  return { municipio, actual: municipioActual, fijar: fijarMunicipio, borrar: borrarMunicipio };
}
