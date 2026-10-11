// criticus r5: random walks op de ECHTE Engine; na elke stap alle predicaten/tellers van de casus evalueren
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const sb=globalThis;sb.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten,E=Engine,casus=CASUSSEN[0];
const alle=[],tellers=[];
function walk(o,epi,inP){  if(Array.isArray(o))o.forEach(x=>walk(x,epi,inP)); else if(o&&typeof o==="object"){
 const isP=typeof o.p==="string"; if(isP)alle.push({o,epi});
 if(o.perKeer)tellers.push({o:o.perKeer,epi});
 Object.keys(o).forEach(k=>walk(o[k],(!epi&&/^E[123]$/.test(k))?k:epi,inP||isP));}}
walk(casus.kaarten,null);casus.episodes.forEach(e=>walk(e,e.id));
console.log("predicaten",alle.length,"perKeer-tellers",tellers.length);
let seed=12345;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
let fouten={},evals=0,stappen=0,afgerond=0;
function check(st,epId){
  const ctx=P.maakContext(casus,epId,st);
  alle.forEach(x=>{ if(x.epi&&x.epi!==epId)return; try{P.evalueer(x.o,ctx);evals++;}catch(e){fouten[e.message]=(fouten[e.message]||0)+1;}});
  tellers.forEach(x=>{ if(x.epi!==epId)return;try{P.tel(x.o,ctx);evals++;}catch(e){fouten[e.message]=(fouten[e.message]||0)+1;}});
}
for(const ep of casus.episodes){
 for(let run=0;run<400;run++){
  const st=E.nieuwSpel(casus,ep.id,{rng:rnd});
  check(st,ep.id);
  for(let s=0;s<60&&!E.eindeBereikt(st);s++){
    const k=ep.repertoire[Math.floor(rnd()*ep.repertoire.length)];
    const kaart=casus.kaarten.find(c=>c.id===k)||(casus.kaarten[k]);
    const doelen=(kaart&&kaart.doelen&&kaart.doelen[ep.id])||[];
    const o={};
    if(doelen.length){const d=doelen[Math.floor(rnd()*doelen.length)];o.doel=d.id;}
    if(kaart&&kaart.opties&&o.doel){const ol=kaart.opties[o.doel]||[];if(ol.length){const x=ol[Math.floor(rnd()*ol.length)];o.optie=typeof x==="string"?x:x.tekst;}}
    const r=rnd()<0.2?E.raadpleeg(st):(rnd()<0.25?E.volgendeDag(st):E.speelKaart(st,k,o));
    stappen++; check(st,ep.id);
  }
  try{E.rondAf(st);}catch(e){} afgerond++; check(st,ep.id);
 }
}
console.log("stappen",stappen,"evaluaties",evals,"runs",afgerond,"fouten",JSON.stringify(fouten,null,1));
