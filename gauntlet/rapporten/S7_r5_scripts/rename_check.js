require("./load.js");const vm=require("vm");const fs=require("fs");
const c=CASUSSEN[0];const J=JSON.stringify;
const evs=require("./ev.json");
function ren(x,map){if(typeof x==="string")return Object.prototype.hasOwnProperty.call(map,x)?map[x]:x;if(Array.isArray(x))return x.map(y=>ren(y,map));if(x&&typeof x==="object"){const o={};for(const k of Object.keys(x))o[Object.prototype.hasOwnProperty.call(map,k)?map[k]:k]=ren(x[k],map);return o}return x}
const ids=new Set();c.kaarten.forEach(k=>ids.add(k.id));c.episodes.forEach(e=>{ids.add(e.id);e.gebeurtenissen.forEach(g=>ids.add(g.id));(e.antibiotica||[]).forEach(a=>ids.add(a))});
const map={};let n=0;ids.forEach(x=>map[x]="zz"+(++n)+"q");
const c2=ren(c,map);
function lcg(z){z>>>=0;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}}
function speel(src,tag){ if(src)vm.runInThisContext(src); let uit=[];
 for(let sp=0;sp<120;sp++){const r=lcg(sp*9+1);const ep=c.episodes[sp%3],ep2=c2.episodes[sp%3];
  const s1=Engine.nieuwSpel(c,ep.id,{rng:lcg(sp),afrondenPasNaGebeurtenissen:true}),s2=Engine.nieuwSpel(c2,ep2.id,{rng:lcg(sp),afrondenPasNaGebeurtenissen:true});
  for(let st=0;st<40&&!Engine.eindeBereikt(s1);st++){const w=r();
   if(w<0.2){Engine.volgendeDag(s1);Engine.volgendeDag(s2)}else{const kid=ep.repertoire[Math.floor(r()*ep.repertoire.length)],kd=c.kaarten.find(x=>x.id===kid),dl=(kd.doelen&&kd.doelen[ep.id])||[];const o={};if(dl.length)o.doel=dl[Math.floor(r()*dl.length)].id;if(kd.opties&&o.doel&&kd.opties[o.doel])o.optie=kd.opties[o.doel][0].tekst;
    Engine.speelKaart(s1,kid,o);Engine.speelKaart(s2,map[kid],{doel:o.doel==null?undefined:(map[o.doel]||o.doel),optie:o.optie})}
   // rondAf-poging
   if(r()<0.1){let a,b;try{Engine.rondAf(s1);a="ok"}catch(e){a=e.message}try{Engine.rondAf(s2);b="ok"}catch(e){b=e.message}
     if(a!==b){uit.push("rondAf verschil spel "+sp+": "+a+" / "+b);break} if(a==="ok")break}}
  // herkansing
  if(s1.afgerond&&s2.afgerond){const h1=Engine.herkansing(s1),h2=Engine.herkansing(s2);if(h1.afrondenPasNaGebeurtenissen!==h2.afrondenPasNaGebeurtenissen)uit.push("herkansing verschil spel "+sp)}
 } return uit}
const o0=speel(null);console.log("origineel:",o0.length,o0);
for(const i of [30,31])console.log(evs[i].naam,"=>",speel(evs[i].src).slice(0,2).join(" | ")||"niet gezien");
