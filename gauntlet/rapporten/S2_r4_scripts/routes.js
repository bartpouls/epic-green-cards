const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','regels/predicaten.js','engine/engine.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const C=CASUSSEN[0],E=C.episodes[0],P=Predicaten;
function speel(lijst){ const st=Engine.nieuwSpel(C,'E1',{rng:()=>0.3}); const log=[];
  for(const x of lijst){ const [k,doel]=Array.isArray(x)?x:[x]; if(st.actiesOver<1) Engine.volgendeDag(st); const r=Engine.speelKaart(st,k,doel?{doel}:{}); if(!r.ok) log.push(k+': '+r.fout);} 
  const ctx=P.maakContext(C,E,st); const inv=E.invarianten.filter(i=>P.evalueer(i.predicaat,ctx)).map(i=>i.id);
  const pr=E.profielen.find(p=>P.evalueer(p.als,ctx)); const dz=E.score.duurzaamheid.regels.find(r=>P.evalueer(r.als,ctx));
  let dm=E.score.doelmatigheid.start;E.score.doelmatigheid.regels.forEach(r=>{if(P.evalueer(r.als,ctx))dm+=r.delta});
  return {inv,profiel:pr&&pr.naam,refl:pr&&pr.reflectievraag,dz:dz&&dz.punten,dm,fouten:log};}
const T={
 'Afwachten V1+N1+Ev1':['V1','N1','Ev1'],
 'Uitgesteld recept V2+N1+N2+Ev1 (zonder middel)':['V2','N1',['N2','V3'],'Ev1'],
 'Uitgesteld V2+N1+Ev1':['V2','N1','Ev1'],
 'Uitgesteld V2+V3+N1+N2(V3)+Ev1':['V2','V3','N1',['N2','V3'],'Ev1'],
 'Nitro V3+N1':['V3','N1'],'Nitro V3+N1+N2+Ev1':['V3','N1',['N2','V3'],'Ev1'],
 'Fosfo V4+N1+N2':['V4','N1',['N2','V4']],'Trimeth V5+N1':['V5','N1'],
 'I1: V3 zonder N1':['V3'],'I1: V1+Ev1 zonder N1':['V1','Ev1'],'I1: leeg':[],'I1: N1 alleen':['N1'],
 'I3: V1+N1':['V1','N1'],'I4: V3+V4+N1':['V3','V4','N1'],'I4: V4+V5+N1':['V4','V5','N1'],'I4: V3+V5+N1':['V3','V5','N1'],'I4: V3,V3,N1 (zelfde twee keer)':['V3','V3','N1'],
};
for(const k in T) console.log(k.padEnd(48),JSON.stringify(speel(T[k])));
// N2 zonder middel
const st=Engine.nieuwSpel(C,'E1',{});console.log('N2 zonder middel:',JSON.stringify(Engine.speelKaart(st,'N2',{})),JSON.stringify(Engine.speelKaart(st,'N2',{doel:'V3'})));
