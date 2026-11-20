// Lecturas cortas de /aprende. Cada una toma su texto de data.js, se lee en un minuto
// y termina con una pregunta que da puntos y Cimacoins a los alumnos con sesión.
// Las preguntas y respuestas viven en backend/config/activities.php (claves modulo-...).
import { risks, familyPlan, kitGroups, ninoOutlook } from "./data";

const risk = (i, id) => ({
  id,
  icon: risks[i].icon,
  title: risks[i].title,
  lead: risks[i].text,
  points: [],
});
const plan = (i, id) => ({
  id,
  icon: "map",
  title: `Plan familiar: ${familyPlan[i].title.toLowerCase()}`,
  lead: familyPlan[i].text,
  points: familyPlan[i].tasks,
  tip: familyPlan[i].tip,
});
const kit = (i, id) => ({
  id,
  icon: "backpack",
  title: `Mochila: ${kitGroups[i].title.toLowerCase()}`,
  lead: "Esto conviene tener listo en la mochila de emergencia",
  points: kitGroups[i].items.map((item) => `${item.name}: ${item.detail.charAt(0).toLowerCase()}${item.detail.slice(1)}`),
});

export const moduleThemes = [
  {
    id: "riesgos",
    title: "El Niño y los riesgos",
    modules: [
      {
        id: "nino-tijuana",
        icon: "cloud",
        title: "El Niño en Tijuana",
        lead: "El Niño hace más probable que llueva fuerte, pero no dice cuándo ni cuánto lloverá en tu colonia",
        points: ninoOutlook.cards.map((card) => `${card.title}: ${card.text.charAt(0).toLowerCase()}${card.text.slice(1)}`),
        tip: "Sigue los avisos del clima y de Protección Civil",
      },
      risk(0, "riesgo-lluvias"),
      risk(1, "riesgo-deslaves"),
      risk(2, "riesgo-inundaciones"),
    ],
  },
  {
    id: "plan",
    title: "Plan familiar",
    modules: [plan(0, "plan-riesgos"), plan(1, "plan-rutas"), plan(2, "plan-tareas"), plan(3, "plan-practica")],
  },
  {
    id: "mochila",
    title: "Mochila de emergencia",
    modules: [kit(0, "mochila-esencial"), kit(1, "mochila-documentos"), kit(2, "mochila-familia")],
  },
];

export const allModules = moduleThemes.flatMap((theme) => theme.modules.map((m) => ({ ...m, theme: theme.id, themeTitle: theme.title })));
export const findModule = (id) => allModules.find((m) => m.id === id);
export const activityKeyOf = (id) => `modulo-${id}`;
