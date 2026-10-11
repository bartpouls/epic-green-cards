const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','regels/predicaten.js','engine/engine.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const C=CASUSSEN[0], E=C.episodes.find(e=>e.id==='E1'), P=Predicaten;
let seed=+process.argv[2]||12345; const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const REP=['G1','G2','O1','O2','V1','V2','V3','V4','V5','N1','N2','Ev1'];
const ALLE=REP.concat(['G3','B1','V6','V7','Ev3']); // incl. buiten repertoire
function oracle(tl){
  const kaarten=tl.map(r=>r.kaart); const h=k=>kaarten.includes(k);
  const ab=['V3','V4','V5'].filter(h); const route=h('V1')||h('V2')||ab.length>0;
  const inv=[]; if(!h('N1')||!route) inv.push('I1'); if(h('V1')&&!h('Ev1')) inv.push('I3'); if(ab.length>1) inv.push('I4');
  let dz=null,profiel=null;
  if(h('V2')){dz=2;profiel='Gedeelde regie'} else if(ab.length){dz=1;profiel='Direct behandelen'} else if(h('V1')){dz=3;profiel='Terughoudend'}
  const dm=Math.max(1,Math.min(3,3-(h('O1')?1:0)-(h('O2')?1:0)));
  return {inv,dz,profiel,dm,fbO1:h('O1'),zN1:!h('N1'),zV1:h('V1')&&!h('Ev1')};
}
function spel(state){
  const ctx=P.maakContext(C,E,state); const ev=(p)=>P.evalueer(p,ctx);
  const inv=E.invarianten.filter(i=>ev(i.predicaat)).map(i=>i.id);
  let k=E.score.duurzaamheid.regels.find(r=>ev(r.als)); const dz=k?k.punten:null;
  const pr=E.profielen.find(p=>ev(p.als)); const profiel=pr?pr.naam:null;
  let dm=E.score.doelmatigheid.start; E.score.doelmatigheid.regels.forEach(r=>{if(ev(r.als)) dm+=r.delta}); dm=Math.max(1,Math.min(3,dm));
  const fb=E.feedbackExtra.some(f=>ev(f.trigger));
  const z=t=>E.zichtbaarAlsOntbreekt.filter(x=>x.tekst===t).some(x=>ev(x.trigger));
  return {inv,dz,profiel,dm,fbO1:fb,zN1:z('Mevrouw weet niet wanneer ze moet bellen.'),zV1:z('Er is geen moment om alsnog te starten als de klachten aanhouden.')};
}
const N=+process.argv[3]||10000; let afw=0,ex=[],stats={ok:0,fout:0,poort:0,schend:{}};
for(let n=0;n<N;n++){
  const st=Engine.nieuwSpel(C,'E1',{rng:rnd}); const len=Math.floor(rnd()*16);
  for(let i=0;i<len;i++){
    const r=rnd();
    if(r<0.12){ try{Engine.volgendeDag(st)}catch(e){} continue;}
    if(r<0.16){ const x=Engine.raadpleeg(st); if(x.ok&&x.kost!==0) {afw++;ex.push('raadplegen kost '+x.kost)} continue;}
    const k=rnd()<0.9?REP[Math.floor(rnd()*REP.length)]:ALLE[Math.floor(rnd()*ALLE.length)];
    const o={}; if(k==='N2'){o.doel=['V3','V4','V5'][Math.floor(rnd()*3)]}
    const before=JSON.stringify(st.tijdlijn); const res=Engine.speelKaart(st,k,o);
    if(res.ok) stats.ok++; else {stats.fout++; if(JSON.stringify(st.tijdlijn)!==before){afw++;ex.push('state veranderd bij fout')}}
  }
  const a=oracle(st.tijdlijn), b=spel(st);
  const gesch=a.inv.length>0;
  const fa=[]; if(JSON.stringify(a.inv)!==JSON.stringify(b.inv)) fa.push('inv '+a.inv+' vs '+b.inv);
  if(!gesch){ if(a.dz!==b.dz) fa.push('dz '+a.dz+' vs '+b.dz); if(a.profiel!==b.profiel) fa.push('profiel '+a.profiel+' vs '+b.profiel);}
  if(a.dm!==b.dm) fa.push('dm'); if(a.fbO1!==b.fbO1) fa.push('fb'); if(a.zN1!==b.zN1) fa.push('zN1'); if(a.zV1!==b.zV1) fa.push('zV1');
  if(fa.length){afw++; if(ex.length<10) ex.push(st.tijdlijn.map(r=>r.kaart).join('+')+' : '+fa.join('; '));}
  if(!gesch) stats.poort++; else a.inv.forEach(i=>stats.schend[i]=(stats.schend[i]||0)+1);
}
console.log(JSON.stringify({N,afw,stats},null,0)); console.log(ex.slice(0,10));
