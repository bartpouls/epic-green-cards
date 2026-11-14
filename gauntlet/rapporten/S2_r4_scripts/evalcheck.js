const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','regels/predicaten.js','regels/evaluatie.js','engine/engine.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const C=CASUSSEN[0];let seed=4242;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const REP=['G1','G2','O1','O2','V1','V2','V3','V4','V5','N1','N2','Ev1'];
let afw=0,n=0,ex=[];
const VRAAG={I1:"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",I3:"Je wacht af. Tot wanneer, en wat gebeurt er dan?",I4:"Wat lost het tweede middel op dat het eerste niet oplost?"};
for(let i=0;i<3000;i++){
  const st=Engine.nieuwSpel(C,'E1',{rng:rnd});const len=Math.floor(rnd()*12);
  for(let j=0;j<len;j++){ if(st.actiesOver<1) Engine.volgendeDag(st); if(st.dagenVoorbij) break; const k=REP[Math.floor(rnd()*12)]; Engine.speelKaart(st,k,k==='N2'?{doel:['V3','V4','V5'][Math.floor(rnd()*3)]}:{}); }
  const h=k=>st.tijdlijn.some(r=>r.kaart===k); const ab=['V3','V4','V5'].filter(h).length; const route=h('V1')||h('V2')||ab>0;
  const inv=[]; if(!h('N1')||!route) inv.push('I1'); if(h('V1')&&!h('Ev1')) inv.push('I3'); if(ab>1) inv.push('I4');
  const u=Engine.rondAf(st); n++;
  const g=u.geschonden.map(x=>x.id); let bad=[];
  if(JSON.stringify(g)!==JSON.stringify(inv)) bad.push('gesch '+g+' vs '+inv);
  if(inv.length){ if(u.poortGehaald||u.score!==null||u.profiel!==null||u.vraag!==VRAAG[inv[0]]) bad.push('schending-uitkomst'); }
  else { const prof=h('V2')?'Gedeelde regie':ab?'Direct behandelen':'Terughoudend'; const dz=h('V2')?2:ab?1:3; const dm=Math.max(1,3-(h('O1')?1:0)-(h('O2')?1:0));
    if(!u.poortGehaald||u.profiel.naam!==prof||u.score.duurzaamheid!==dz||u.score.doelmatigheid!==dm) bad.push('score/profiel '+JSON.stringify([u.profiel,u.score]));
    const fb=u.extraVragen.some(v=>v.vraag==='Wat doe je bij welke uitslag anders?'); if(fb!==h('O1')) bad.push('fbO1'); }
  if(bad.length){afw++;if(ex.length<5)ex.push(st.tijdlijn.map(r=>r.kaart).join('+')+': '+bad.join('; '))}
}
console.log({n,afw});console.log(ex);
