// Datos de cada municipio de Baja California para mostrar el sitio según dónde vive la persona.
// zona es el nombre que usan zonas.js y backend/config/zonas.php. sep es el nombre del municipio
// en el catálogo de escuelas de la SEP.
// Los números de los otros municipios son los publicados en sus sitios oficiales y en los de
// Cruz Roja, DIF y Educación BC (consulta del 27 de noviembre de 2026, cada uno con su fuente).
// No se llamó a ninguno. Muchos son de oficina y no de despacho: por eso cada número lleva su tipo
// y junto a él siempre se recuerda el 911. Los que faltan se quedan en null y no se inventan.
// Mientras falten, el sitio muestra el 911 con un aviso.
import { agencies, emergency, VIOLET_SQUAD_PHONE } from "./data";

const agency = (id) => agencies.find((item) => item.id === id);
const phoneOf = (theme) => emergency.phones.find((item) => item.theme === theme);
const redCrossTijuana = emergency.redCrossStations.find((item) => item.id === "cruz-roja-tijuana");

// Fuentes que se repiten
const GUIA_EDUCACION =
  "https://www.educacionbc.edu.mx/wordpress/wp-content/uploads/2025/08/Guiarapidaactuacionsituacionesriesgoentornoescolar2025.pdf";
const DIF_PSICOLOGIA = "https://retys.bajacalifornia.gob.mx/Portal/TyS/319?temaId=18";
const GEOVISOR_MEXICALI = "https://www.mexicali.gob.mx/sitioimip/geovisor/geovisor/?geovisor_id=2";

// Teléfonos locales de un municipio. Cada uno es null si todavía no lo tenemos, o
// { numeros, tipo, tipos, detalle, nombre, fuente, porConfirmar }:
// tipo dice qué es el número ("Oficina", "Citas"...), tipos lo dice por número cuando cambia,
// nombre reemplaza el de la dependencia (por ejemplo cuando Protección Civil y Bomberos comparten oficina).
const telefonos = (datos) => ({
  proteccionCivil: null,
  bomberos: null,
  cruzRoja: null,
  policia: null,
  agua: null,
  violeta: null,
  psicologico: null,
  ...datos,
});

export const municipios = [
  {
    id: "tijuana",
    zona: "Tijuana",
    nombre: "Tijuana",
    sep: "Tijuana",
    centro: [32.5149, -117.0382],
    // Caja aproximada del municipio: oeste, norte, este, sur (para buscar direcciones)
    caja: [-117.13, 32.58, -116.6, 32.28],
    ayuntamiento: "https://www.tijuana.gob.mx/emergencias/",
    proteccionCivilUrl: "https://proteccioncivil.tijuana.gob.mx/",
    // El mapa de Tijuana se abre dentro del sitio (Home.vue, emergency.riskMapUrl)
    atlas: { url: emergency.riskMapUrl, label: "Atlas de Riesgos 2024 del IMPLAN" },
    telefonos: telefonos({
      proteccionCivil: { numeros: phoneOf("civil").numbers, tipo: "Oficina", fuente: phoneOf("civil").source },
      bomberos: { numeros: phoneOf("fire").numbers, tipo: "Oficina", fuente: phoneOf("fire").source },
      cruzRoja: { numeros: [redCrossTijuana.phones[1]], tipo: "Urgencias", fuente: emergency.redCrossUrl },
      policia: { numeros: agency("policia").phones, tipo: "Oficina central", fuente: agency("policia").source },
      agua: { numeros: agency("cespt").phones, tipo: "Reportes", nombre: "CESPT", whatsapp: "664 370 1531", fuente: null },
      violeta: { numeros: [VIOLET_SQUAD_PHONE], fuente: null },
    }),
    enlaces: [
      { label: "Directorio oficial del Ayuntamiento", href: "https://www.tijuana.gob.mx/emergencias/" },
      { label: "Seguridad Pública y denuncia anónima", href: "https://policia.tijuana.gob.mx/contacto.aspx" },
      { label: "Protección Civil Tijuana", href: "https://proteccioncivil.tijuana.gob.mx/" },
      { label: "Bomberos Tijuana", href: "https://bomberos.tijuana.gob.mx/" },
    ],
  },
  {
    id: "rosarito",
    zona: "Rosarito",
    nombre: "Rosarito",
    sep: "Playas de Rosarito",
    centro: [32.3615, -117.0554],
    caja: [-117.15, 32.45, -116.8, 32.05],
    ayuntamiento: "https://www.rosarito.gob.mx/",
    proteccionCivilUrl: null,
    atlas: {
      url: "https://implanplayasderosarito.gob.mx/atlas-de-riesgos-naturales-2015/",
      label: "Atlas de Riesgos Naturales del IMPLAN",
      nota: "Es de 2015",
    },
    // Las estaciones de data.js no tienen teléfono propio publicado: no se les asigna ninguno.
    telefonos: telefonos({
      proteccionCivil: {
        numeros: ["661 613 1145"],
        tipo: "Oficina",
        nombre: "Protección Civil y Bomberos",
        conjunto: true,
        fuente: "https://www.rosarito.gob.mx/directorio/",
      },
      bomberos: {
        numeros: ["661 613 1145"],
        tipo: "Oficina",
        nombre: "Protección Civil y Bomberos",
        conjunto: true,
        fuente: "https://www.rosarito.gob.mx/directorio/",
      },
      cruzRoja: {
        numeros: ["661 612 0414", "661 612 4068"],
        tipos: ["Administrativa", "Oficina"],
        detalle: "René Ortiz Campoy 100, Zona Centro",
        fuente: "https://www.cruzrojarosarito.org.mx/contacto/",
      },
      psicologico: {
        numeros: ["661 688 1308"],
        tipo: "Citas",
        nombre: "IMMUJER, apoyo psicológico gratis",
        whatsapp: "661 113 8016",
        fuente: "https://www.rosarito.gob.mx/mujer-sos/nota/433",
      },
      policia: {
        numeros: ["661 614 9600"],
        tipo: "Conmutador, ext. 4033",
        nombre: "Secretaría de Seguridad Ciudadana",
        fuente: "https://www.rosarito.gob.mx/mujer-sos/dependencia-Secretar%C3%ADa%2Bde%2BSeguridad%2BCiudadana",
      },
      agua: {
        numeros: ["073"],
        tipo: "Reportes",
        nombre: "CESPT",
        whatsapp: "664 370 1531",
        fuente: "https://www.cespt.gob.mx/noticiascespt/noticia.aspx?id=1526",
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "IMMUJER Rosarito",
        numeros: ["661 688 1308"],
        tipo: "Oficina",
        whatsapp: "661 113 8016",
        fuente: "https://www.rosarito.gob.mx/mujer-sos/nota/265",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026). No prueba que estén abiertos hoy.
    // Primo Tapia: el listado dice "Cipriano Portugal 23612" y no se sabe si es número o código postal.
    refugios: [
      { name: "Unidad Deportiva Reforma", address: "Calle Plan de San Luis 157, Ampliación Reforma" },
      { name: "Centro Comunitario Primo Tapia", address: "Cipriano Portugal, Primo Tapia" },
      { name: "Centro Comunitario Tonantzin", address: "Calle 5001, Ampliación Constitución" },
    ],
    enlaces: [{ label: "Ayuntamiento de Rosarito", href: "https://www.rosarito.gob.mx/" }],
  },
  {
    id: "tecate",
    zona: "Tecate",
    nombre: "Tecate",
    sep: "Tecate",
    centro: [32.5725, -116.6266],
    caja: [-116.8, 32.62, -116.05, 32.05],
    ayuntamiento: "https://tecate.gob.mx/",
    proteccionCivilUrl: null,
    // Su atlas de 2024 es un archivo de 421 MB que no sirve en un celular: no se enlaza.
    atlas: null,
    telefonos: telefonos({
      proteccionCivil: {
        numeros: ["665 521 1218"],
        tipo: "Oficina",
        nombre: "Protección Civil y Bomberos",
        conjunto: true,
        fuente: "https://tecate.gob.mx/ayuntamiento",
      },
      bomberos: { numeros: ["665 654 1711"], tipo: "Central de Bomberos", fuente: GUIA_EDUCACION },
      cruzRoja: {
        numeros: ["665 521 2447"],
        tipo: "Oficina",
        detalle: "Av. Benito Juárez 411, Pro-hogar",
        fuente: "https://facisalud.tij.uabc.mx/wp-content/uploads/2025/07/Directorio-Unidad-de-Proteccion-Civil.pdf",
      },
      psicologico: {
        numeros: ["665 654 1535"],
        tipo: "Información y registro",
        nombre: "DIF Tecate, psicología",
        fuente: "https://tecate.gob.mx/noticias/249",
      },
      policia: {
        numeros: ["665 654 4782"],
        tipo: "Oficina",
        nombre: "Seguridad Pública y Tránsito Municipal",
        fuente: "https://tecate.gob.mx/ayuntamiento",
      },
      agua: {
        numeros: ["073", "665 654 6032"],
        tipos: ["Desde teléfono fijo, 24 horas", "Desde celular, 24 horas"],
        nombre: "CESPTE",
        fuente: "https://cespte.gob.mx/telefono-emergencia-073-desde-telefono-fijo-de-celular-marca-6546032/",
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "IMMUJER Tecate",
        numeros: ["665 654 3390"],
        tipo: "Oficina",
        fuente: "https://tecate.gob.mx/ayuntamiento",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026, y boletín municipal del 11/10/2026).
    // No prueba que estén abiertos hoy.
    refugios: [
      { name: "Centro Comunitario DIF Tecate", address: "Carretera Mexicali-Tijuana, col. Luis Echeverría" },
      { name: "Salón Ejidal DIF Tecate", address: "Carretera Tecate-Ensenada, Nueva Colonia Hindú" },
      { name: "Centro Comunitario DIF Tecate, La Rumorosa", address: "Carretera Mexicali-Tijuana, poblado La Rumorosa" },
      { name: "DIF Municipal Tecate", address: "Calle Profesor José Gutiérrez Durán, fracc. La Hacienda" },
    ],
    enlaces: [{ label: "Ayuntamiento de Tecate", href: "https://tecate.gob.mx/" }],
  },
  {
    id: "ensenada",
    zona: "Ensenada",
    nombre: "Ensenada",
    sep: "Ensenada",
    centro: [31.8667, -116.5964],
    caja: [-116.95, 32.2, -115.4, 30.7],
    ayuntamiento: "https://www.ensenada.gob.mx/",
    proteccionCivilUrl: "https://proteccioncivilensenada.com/",
    atlas: {
      url: "https://atlasderiesgos.imipens.org/",
      label: "Atlas de Riesgos del IMIP Ensenada",
      nota: "Mayo de 2026",
      pdf: "https://proteccioncivilensenada.com/formatos/Atlas.pdf",
    },
    telefonos: telefonos({
      proteccionCivil: {
        numeros: ["646 173 9710"],
        tipo: "Oficina",
        detalle: "Ramírez Méndez y Narciso Mendoza s/n",
        fuente: "https://proteccioncivilensenada.com/",
      },
      bomberos: { numeros: ["646 120 5435"], tipo: "Oficina", fuente: GUIA_EDUCACION },
      cruzRoja: {
        numeros: ["646 174 4585", "646 175 9090", "646 176 7584"],
        tipos: ["Unidad Moderna", "Unidad Moderna", "Unidad Valle Dorado"],
        fuente: "https://cruzrojaensenada.org/ubicacion/",
      },
      psicologico: {
        numeros: ["646 173 4643"],
        tipo: "Orientación y citas",
        nombre: "Instituto Municipal de la Mujer",
        fuente: "https://www.ensenada.gob.mx/?p=31985",
      },
      policia: {
        numeros: ["646 182 3000"],
        tipo: "Oficina",
        nombre: "Seguridad Pública Municipal",
        fuente: "https://www.ensenada.gob.mx/?p=22711",
      },
      agua: {
        numeros: ["073", "646 177 2631", "646 177 2652", "646 177 2654"],
        tipo: "Reportes, 24 horas",
        nombre: "CESPE",
        whatsapp: "646 199 9936",
        detalle: "WhatsApp todos los días de 7 a 21 h",
        fuente: "https://www.cespe.gob.mx/public/cuenta-cespe-con-nuevo-numero-de-whatsapp-para-atencion-de-reportes",
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "INMUJERE Ensenada",
        numeros: ["646 173 4643"],
        tipo: "Orientación y acompañamiento psicológico",
        fuente: "https://www.ensenada.gob.mx/?p=25011",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026). No prueba que estén abiertos hoy.
    refugios: [
      { name: "CDC DIF Floresta", address: "Av. Floresta 330, col. Obrera" },
      { name: "CDC DIF Maneadero", address: "El Maneadero Parte Baja, Rodolfo Sánchez Taboada, C.P. 22790" },
      { name: "Gimnasio de la Colonia Hidalgo, CART Ensenada", address: "Av. Diamante 2004, col. Hidalgo" },
    ],
    enlaces: [
      { label: "Ayuntamiento de Ensenada", href: "https://www.ensenada.gob.mx/" },
      { label: "Protección Civil Ensenada", href: "https://proteccioncivilensenada.com/" },
    ],
  },
  {
    id: "mexicali",
    zona: "Mexicali",
    nombre: "Mexicali",
    sep: "Mexicali",
    centro: [32.6245, -115.4523],
    caja: [-116.05, 32.72, -114.7, 31.6],
    ayuntamiento: "https://www.mexicali.gob.mx/portalmexicali",
    proteccionCivilUrl: null,
    atlas: { url: GEOVISOR_MEXICALI, label: "Geovisor de riesgos del IMIP Mexicali" },
    telefonos: telefonos({
      proteccionCivil: {
        numeros: ["686 554 9211"],
        tipo: "Oficina",
        detalle: "Lunes a viernes de 8 a 15 h",
        fuente: "https://www.mexicali.gob.mx/webpub/tramites/Tramite/Formato/151",
      },
      bomberos: {
        numeros: ["686 561 8212"],
        tipo: "Dirección",
        detalle: "Blvd. Lázaro Cárdenas 1601",
        fuente: "https://mexicali.gob.mx/portalmexicali/dependencia/bomberos",
      },
      cruzRoja: {
        numeros: ["686 563 6901", "686 563 6900"],
        tipos: ["General", "Ambulancia"],
        fuente: "https://cruzrojamexicali.org/",
      },
      psicologico: {
        numeros: ["686 568 4742", "686 568 4723"],
        tipo: "Citas",
        detalle: "Lunes a viernes de 8 a 17 h",
        nombre: "DIF, atención psicológica",
        fuente: DIF_PSICOLOGIA,
      },
      policia: {
        numeros: ["686 558 1200"],
        tipo: "Oficina",
        nombre: "Seguridad Pública Municipal",
        fuente: "https://www.mexicali.gob.mx/portalmexicali/dependencia/dspm",
      },
      agua: {
        numeros: ["073", "686 564 6101"],
        tipos: ["Reportes, 24 horas", "Reportes, 24 horas"],
        nombre: "CESPM",
        whatsapp: "686 569 8020",
        fuente: "https://retys.bajacalifornia.gob.mx/Portal/TyS/537?perfilId=4",
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "Instituto Municipal de la Mujer (IMMM)",
        numeros: ["686 558 1600"],
        tipo: "Oficina, ext. 4015",
        fuente: "https://www.mexicali.gob.mx/inmujer/quienes.html",
      },
      {
        nombre: "Centro de Justicia para las Mujeres (CEJUM)",
        numeros: ["686 844 6183", "686 722 1386"],
        tipos: ["Oficina", "Móvil"],
        detalle: "Su página dice que atiende las 24 horas todos los días",
        fuente: "https://www.bajacalifornia.gob.mx/cejum/quienessomos/contactanos",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026). No prueba que estén abiertos hoy.
    refugios: [
      { name: "Punto Eco DIF BC", address: "Parque Vicente Guerrero, Blvd. Adolfo López Mateos y Alfonso Esquer Sandez s/n, col. Industrial" },
      { name: "CDC Pilares Baja California DIF BC", address: "Av. Bahía de Todos los Santos y Av. San Luis Potosí 2000, col. Baja California" },
      { name: "Albergue Peregrino", address: "Calzada de los Presidentes casi esquina con calle Ciudad Victoria" },
      { name: "CDHI Delta-Oaxaca", address: "Av. Lázaro Cárdenas s/n, Estación Delta, Valle de Mexicali" },
      { name: "CDHI Carranza", address: "Calle Hipólito Rentería entre General Gil Dardo Magaña y Av. Valentín Gómez, Valle de Mexicali" },
      { name: "Salón Ejidal del Ejido Nayarit", address: "Blvd. Lázaro Cárdenas frente al parque del Ejido Nayarit, Valle de Mexicali" },
    ],
    enlaces: [{ label: "Ayuntamiento de Mexicali", href: "https://www.mexicali.gob.mx/portalmexicali" }],
  },
  {
    id: "san-quintin",
    zona: "San Quintín",
    nombre: "San Quintín",
    sep: "San Quintín",
    centro: [30.5603, -115.9386],
    caja: [-116.3, 30.9, -114.9, 28.0],
    ayuntamiento: "https://www.sanquintin.gob.mx/",
    proteccionCivilUrl: null,
    atlas: null,
    // Protección Civil y Bomberos no tienen un número confirmado. El 616 166 1000 es el conmutador
    // del C5 estatal y el 616 598 0027 es de Sindicatura: ninguno se usa aquí.
    telefonos: telefonos({
      cruzRoja: {
        numeros: ["616 165 3637"],
        tipo: "Oficina",
        porConfirmar: true,
        fuente: "https://s3.amazonaws.com/assets.cruzrojamexicana.org.mx/froala/archivo_TueApr2800cr35cr02UTC2020_1.pdf",
      },
      psicologico: {
        numeros: ["616 166 5560", "616 166 5761"],
        tipo: "Citas",
        detalle: "Lunes a viernes de 8 a 17 h",
        nombre: "DIF, atención psicológica",
        fuente: DIF_PSICOLOGIA,
      },
      agua: {
        numeros: ["073", "646 177 2631", "646 177 2652", "646 177 2654", "616 166 2395"],
        tipo: "Reportes, 24 horas",
        nombre: "CESPE",
        whatsapp: "646 199 9936",
        detalle: "WhatsApp todos los días de 7 a 21 h. Sucursal de lunes a viernes de 8 a 17 h y sábado de 9 a 13 h",
        fuente: "https://retys.bajacalifornia.gob.mx/Portal/TyS/843?temaId=10",
        tipos: ["Reportes, 24 horas", "Reportes, 24 horas", "Reportes, 24 horas", "Reportes, 24 horas", "Sucursal Vicente Guerrero, oficina"],
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "Centro de Justicia para las Mujeres (CEJUM)",
        numeros: ["616 596 3960", "616 119 6463"],
        tipos: ["Oficina", "Móvil"],
        detalle: "Su página dice que atiende las 24 horas todos los días",
        fuente: "https://www.bajacalifornia.gob.mx/cejum/quienessomos/contactanos",
      },
      {
        nombre: "Secretaría de las Mujeres",
        numeros: ["616 165 1899"],
        tipo: "Sede San Quintín",
        fuente: "https://bajacalifornia.gob.mx/mujeres/Conocenos/Ubicaciones",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026). No prueba que estén abiertos hoy.
    refugios: [
      { name: "Delegación Camalú, Escuela Secundaria 105", address: "Av. Emiliano Zapata, Camalú" },
      { name: "Iglesia Monte Horeb", address: "Av. Paralelo 28 núm. 27" },
      { name: "Delegación Vicente Guerrero, Iglesia La Misión", address: "Calle Vicente Guerrero, Vicente Guerrero" },
      { name: "Delegación San Quintín, Iglesia Metodista", address: "Poblado El Papalote" },
      { name: "Delegación El Rosario, Salón DIF", address: "El Rosario de Abajo, col. Los Duarte" },
      { name: "Asociación Pesquera Regasa Núm. 2 SPR de RL", address: "El Rosario de Abajo, col. Los Duarte" },
      { name: "CEMSAD del Rosario", address: "El Rosario de Arriba, col. Misión" },
      { name: "Gimnasio de Usos Múltiples", address: "El Rosario de Arriba, col. Misión" },
      { name: "Delegación Punta Prieta, Telesecundaria Valentín Gómez Farías 30", address: "Santa Rosalita" },
      { name: "Escuela Primaria Miguel Hidalgo y Costilla", address: "Santa Rosalita" },
      { name: "Escuela Primaria Xicoténcatl Leyva Alemán", address: "" },
      { name: "Escuela Primaria General Lázaro Cárdenas", address: "Punta Prieta" },
      { name: "Delegación Villa Jesús María, Escuela Secundaria 91", address: "Villa Jesús María" },
      { name: "Escuela Primaria Ignacio Zaragoza", address: "Villa Jesús María" },
      { name: "Clínica de la Mancha", address: "El Barril, Villa Jesús María" },
      { name: "Delegación Bahía de los Ángeles", address: "Poblado Bahía de los Ángeles" },
      { name: "Primaria Benito Juárez", address: "Poblado Bahía de los Ángeles" },
      { name: "Salón Ejidal Tierra y Libertad", address: "Poblado Bahía de los Ángeles" },
      { name: "Delegación El Mármol, Escuela Primaria Revolución", address: "Cataviña" },
    ],
    enlaces: [{ label: "Ayuntamiento de San Quintín", href: "https://www.sanquintin.gob.mx/" }],
  },
  {
    id: "san-felipe",
    zona: "San Felipe",
    nombre: "San Felipe",
    sep: "San Felipe",
    centro: [31.0256, -114.837],
    caja: [-115.4, 31.7, -114.1, 29.5],
    ayuntamiento: "https://sanfelipe.gob.mx/",
    proteccionCivilUrl: null,
    atlas: { url: GEOVISOR_MEXICALI, label: "Geovisor de riesgos del IMIP Mexicali", nota: "San Felipe usa el atlas de Mexicali" },
    telefonos: telefonos({
      proteccionCivil: {
        numeros: ["686 577 1182"],
        tipo: "Oficina",
        nombre: "Protección Civil y Bomberos",
        conjunto: true,
        detalle: "Av. Mar Blanco 759, Zona Centro",
        fuente: "https://dl.sanfelipe.gob.mx/transparencia/Pagina/Directorio%20General.pdf",
      },
      bomberos: {
        numeros: ["686 577 1182"],
        tipo: "Oficina",
        nombre: "Protección Civil y Bomberos",
        conjunto: true,
        detalle: "Av. Mar Blanco 759, Zona Centro",
        fuente: "https://dl.sanfelipe.gob.mx/transparencia/Pagina/Directorio%20General.pdf",
      },
      cruzRoja: { numeros: ["686 577 1544"], tipo: "Oficina", fuente: "https://recuperacion-transparencia.sanfelipe.gob.mx/" },
      psicologico: {
        numeros: ["686 577 0895"],
        tipo: "Citas",
        detalle: "Lunes a viernes de 8 a 17 h",
        nombre: "DIF, atención psicológica",
        fuente: DIF_PSICOLOGIA,
      },
      policia: {
        numeros: ["686 577 1134"],
        tipo: "Oficina",
        nombre: "Seguridad Pública Municipal",
        fuente: "https://dl.sanfelipe.gob.mx/transparencia/Pagina/Directorio%20General.pdf",
      },
      agua: {
        numeros: ["073", "686 564 6101", "686 564 2610"],
        tipos: ["Reportes, 24 horas", "Reportes, 24 horas", "Centro de Atención San Felipe, oficina"],
        nombre: "CESPM",
        whatsapp: "686 569 8020",
        fuente: "https://cespm.gob.mx/centros-atencion",
        detalle: "Centro de Atención en carretera al Aeropuerto s/n, de lunes a viernes de 8 a 15 h y sábado de 9 a 12 h",
      },
    }),
    // Atención a mujeres en situación de violencia (oficinas y centros, no líneas de emergencia)
    mujeres: [
      {
        nombre: "Atención Integral a la Mujer",
        numeros: ["686 598 8588"],
        tipo: "Secretaría de las Mujeres, sede San Felipe",
        fuente: "https://bajacalifornia.gob.mx/mujeres/Conocenos/Ubicaciones",
      },
    ],
    // Se usaron como refugio en octubre de 2026 (ZETA, 29/10/2026). No prueba que estén abiertos hoy.
    refugios: [
      { name: "Salón Social Ejidal Plan Nacional Agrario", address: "Calle Independencia M. 25" },
      { name: "COBACH Plantel San Felipe", address: "Calle de los Pinos 601" },
      { name: "Escuela Primaria Jaime Nuño", address: "Calle Acapulco 69" },
    ],
    enlaces: [{ label: "Ayuntamiento de San Felipe", href: "https://sanfelipe.gob.mx/" }],
  },
];

export const DEFAULT_MUNICIPIO = "tijuana";

const plano = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .trim();

// Acepta el id ("san-quintin"), el nombre de zonas.js ("San Quintín") o el de la SEP ("Playas de Rosarito").
export function buscarMunicipio(valor) {
  const key = plano(valor);
  if (!key) return null;
  return municipios.find((m) => m.id === key || plano(m.zona) === key || plano(m.sep) === key) ?? null;
}

export const municipioPorDefecto = () => buscarMunicipio(DEFAULT_MUNICIPIO);
export const esTijuana = (m) => m?.id === "tijuana";

// Teléfono local con respaldo: si el municipio no lo tiene, se da el 911 y un aviso.
// Nunca se cae al número de Tijuana.
export function telefono(m, clave) {
  const dato = m?.telefonos?.[clave];
  if (dato?.numeros?.length) return { ...dato, falta: false, aviso: "" };
  return {
    numeros: ["911"],
    fuente: null,
    falta: true,
    aviso: `Aún no tenemos este número para ${m?.nombre ?? "tu municipio"}, en emergencia llama al 911`,
  };
}

// Números con su tipo, para mostrarlos como "686 563 6900 · Ambulancia"
export function llamadas(dato) {
  if (!dato || dato.falta) return [];
  return dato.numeros.map((numero, i) => ({
    numero,
    tipo: [dato.tipos?.[i] ?? dato.tipo, dato.porConfirmar ? "por confirmar" : ""].filter(Boolean).join(", "),
  }));
}

// Estaciones de data.js del municipio. Las que no traen city son de Tijuana.
export const estacionesDe = (m, lista) => lista.filter((item) => (item.city ?? "Tijuana") === m.zona);

// Textos generales con el nombre del municipio
export function textos(m) {
  const nombre = m?.nombre ?? "Tijuana";
  return {
    titulo: `${nombre} se prepara para El Niño`,
    lugar: `${nombre}, Baja California`,
    elNino: `El Niño en ${nombre}`,
    riesgos: `Qué puede pasar en ${nombre}`,
    compartir: `Prepárate para las lluvias de El Niño en ${nombre}`,
    familias: `familias de ${nombre}`,
  };
}

// Lista de datos que faltan por municipio (para el equipo)
export function faltantes() {
  return municipios.map((m) => ({
    id: m.id,
    faltan: [
      ...Object.entries(m.telefonos)
        // El Escuadrón Violeta solo existe en Tijuana, y Tijuana ya tiene el 075 y las líneas de apoyo
        .filter(([clave, dato]) => !dato?.numeros?.length && clave !== "violeta" && !(clave === "psicologico" && m.id === "tijuana"))
        .map(([clave]) => clave),
      ...(m.ayuntamiento ? [] : ["ayuntamiento"]),
      ...(m.atlas ? [] : ["atlas"]),
    ],
  }));
}
