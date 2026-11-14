const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten,E=Engine,casus=CASUSSEN[0];
let seed=777;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
let diff=0,n=0,metEvent=0;
for(const ep of casus.episodes){for(let run=0;run<500;run++){
 const st=E.nieuwSpel(casus,ep.id,{rng:rnd});
 for(let s=0;s<50&&!E.eindeBereikt(st);s++){
  const k=ep.repertoire[Math.floor(rnd()*ep.repertoire.length)];
  const kaart=casus.kaarten.find(c=>c.id===k);const doelen=(kaart&&kaart.doelen&&kaart.doelen[ep.id])||[];const o={};
  if(doelen.length){const d=doelen[Math.floor(rnd()*doelen.length)];o.doel=d.id;}
  if(kaart&&kaart.opties&&o.doel){const ol=kaart.opties[o.doel]||[];if(ol.length){const x=ol[0];o.optie=typeof x==="string"?x:x.tekst;}}
  if(rnd()<0.3)E.volgendeDag(st);else E.speelKaart(st,k,o);
  const ctx=P.maakContext(casus,ep.id,st);
  if(st.gebeurtenissen.length)metEvent++;
  for(const nm of ["resistent","gevoelig"]){ for(const ab of ep.antibiotica){
    // elk antibioticum "actief" mits het in de set zit: forceer door eigen tijdlijn
    const tl=[{volg:1,kaart:ab,dag:1,doel:null,optie:null}];
    const c2=P.maakContext(casus,ep,{tijdlijn:tl,gebeurtenissen:st.gebeurtenissen,toestanden:[],klachten:[],dag:st.dag});
    const viaPred=P.evalueer({p:"actief",middel:ab,uitSet:nm},c2);
    const viaEngine=(st.sets[nm]||[]).indexOf(ab)>=0;
    n++; if(viaPred!==viaEngine){diff++; if(diff<5)console.log("VERSCHIL",ep.id,nm,ab,viaPred,viaEngine,JSON.stringify(st.gebeurtenissen),JSON.stringify(st.sets));}
  }}
 }}}
console.log("vergelijkingen",n,"met event",metEvent,"verschillen",diff);
