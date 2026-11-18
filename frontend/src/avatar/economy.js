// Reglas de la tienda del kit de avatares (precios, compras, retos y secreto).
// El saldo y su guardado viven en composables/useCimacoins.js.
import {defaults,find,kits,secretKit} from './art.js';

export const bundleDiscount = 0.20;
export const rewardItems = {
  // Se ganan en el sitio (ver siteRewards en useCimacoins.js), no se compran
  'espalda/mochila':'mochila-lista',
  'cuello/medalla':'plan-listo',
  'marco/explorador':'explorador'
};
const tierPrices = {
  'Común':[20,35,45],
  'Poco común':[45,65,80],
  'Raro':[85,110,135],
  'Épico':[150,185,220],
  'Legendario':[290,355,420]
};
const deluxeSlots = new Set(['cabeza','espalda','torso','fondo','marco','efecto']);
const smallSlots = new Set(['ojos','boca','marcas']);
export const itemKey = (group,id) => `${group}/${id}`;
export function itemPrice(group,id) {
  const item=find(group,id);
  if(!item) return null;
  if(id===defaults[group]||id==='ninguno') return 0;
  if(item.rarity==='Secreto'||rewardItems[itemKey(group,id)]) return null;
  return tierPrices[item.rarity][smallSlots.has(group)?0:deluxeSlots.has(group)?2:1];
}
export function owns(economy,group,id) {
  return itemPrice(group,id)===0||economy.owned.includes(itemKey(group,id));
}
export function kitOffer(kit,economy) {
  const missing=Object.entries(kit.state).filter(([group,id])=>!owns(economy,group,id));
  const priced=missing.map(([group,id])=>itemPrice(group,id));
  if(priced.some(price=>price===null)) return {owned:false,price:null};
  const subtotal=priced.reduce((sum,price)=>sum+price,0);
  const price = Math.ceil(subtotal*(1-bundleDiscount)/5)*5;
  return {owned:missing.length===0,price};
}
export function itemOffer(group,id,economy) {
  return {owned:owns(economy,group,id),price:itemPrice(group,id)};
}
export const signals = Object.freeze({
  cloud:'Nube',drop:'Gota',sun:'Sol',star:'Estrella',bolt:'Rayo',hill:'Cerro'
});
const signalIds=Object.keys(signals);
export const activities = [
  {id:'senal-lluvia',name:'Señales de lluvia',coins:85,pattern:['cloud','drop','sun'],clue:{place:1,signal:'drop'}},
  {id:'ruta-mochila',name:'Ruta de la mochila',coins:125,pattern:['hill','cloud','sun','drop'],clue:{place:2,signal:'cloud'}},
  {id:'mapa-cuenca',name:'Mapa de la cuenca',coins:170,pattern:['drop','hill','sun','bolt','cloud'],clue:{place:3,signal:'star'}},
  {id:'senal-radio',name:'Señal de radio',coins:220,pattern:['star','hill','cloud','bolt','drop','sun']},
  {id:'diario',name:'Reto diario',coins:150}
];
const secretPattern = activities.filter(activity=>activity.clue).map(activity=>activity.clue.signal);
export const localDay = (date=new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function activityPattern(activity,day) {
  if(activity.pattern) return activity.pattern;
  let permutation = Number(day.replaceAll('-',''));
  return Array.from({length:7},()=>{
    permutation = (permutation*48271+1)%2147483647;
    return signalIds[permutation%signalIds.length];
  });
}
export function purchase(economy,target) {
  const preset=target.kit?kits.find(kit=>kit.id===target.kit):undefined;
  const offer=preset?kitOffer(preset,economy):itemOffer(target.group,target.id,economy);
  if(offer.owned||offer.price===null||offer.price>economy.coins) return null;
  const items=preset?Object.entries(preset.state):[[target.group,target.id]];
  return {
    ...economy,coins:economy.coins-offer.price,
    owned:[...new Set([...economy.owned,...items.filter(([g,id])=>itemPrice(g,id)>0).map(([g,id])=>itemKey(g,id))])]
  };
}
export const activityClaimed = (economy,id,day) => id==='diario'?economy.daily>=day:economy.completed.includes(id);
const matches = (a,b) => a.length===b.length&&b.every((signal,i)=>a[i]===signal);
export function completeActivity(economy,id,answer,day=localDay()) {
  const activity=activities.find(activity=>activity.id===id);
  if(!activity||activityClaimed(economy,id,day)||!matches(answer,activityPattern(activity,day))) return null;
  const rewards=Object.entries(rewardItems).filter(([,activityId])=>id===activityId).map(([key])=>key);
  return {
    ...economy,coins:economy.coins+activity.coins,
    completed:id==='diario'?economy.completed:[...economy.completed,id],
    daily:id==='diario'?day:economy.daily,
    owned:[...new Set([...economy.owned,...rewards])]
  };
}
export const foundClues = economy => activities.filter(activity=>activity.clue&&economy.completed.includes(activity.id)).map(activity=>activity.clue);
export function unlockSecret(economy,answer) {
  if(economy.angelic||foundClues(economy).length!==secretPattern.length||!matches(answer,secretPattern)) return null;
  return {
    ...economy,angelic:true,
    owned:[...new Set([...economy.owned,...Object.entries(secretKit.state).filter(([group,id])=>itemPrice(group,id)!==0).map(([group,id])=>itemKey(group,id))])]
  };
}
