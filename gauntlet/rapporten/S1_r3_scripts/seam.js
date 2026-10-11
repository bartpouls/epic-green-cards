const {maak}=require('./laad.js');
const sb=maak();const C=sb.CASUSSEN[0],P=sb.Predicaten,E=sb.Engine;
console.log('episodes',C.episodes.map(e=>e.id+':'+e.repertoire.length+' rep'));
// repertoire vs vanafEpisode vs doelen
C.episodes.forEach(ep=>{
  const n=+ep.id.slice(1);
  const rep=new Set(ep.repertoire);
  C.kaarten.forEach(k=>{
    const inRep=rep.has(k.id);
    if(inRep&&k.vanafEpisode>n)console.log('NAAD: kaart',k.id,'in repertoire',ep.id,'maar vanaf',k.vanafEpisode);
    if(!inRep&&k.vanafEpisode<=n&&!(n===2&&false))console.log('opm: kaart',k.id,'vanaf',k.vanafEpisode,'niet in repertoire',ep.id);
    if(k.doelkaart&&inRep&&!(k.doelen&&k.doelen[ep.id]))console.log('NAAD: doelkaart',k.id,'zonder doelen',ep.id);
    if(k.doelen&&k.doelen[ep.id]&&!inRep)console.log('NAAD: doelen voor',k.id,ep.id,'maar niet in repertoire');
  });
  console.log(ep.id,'antibiotica',ep.antibiotica.join(),'medicatie',(ep.patient.medicatie||[]).map(m=>m.id).join(),'startToestanden',ep.startToestanden);
});
// valideer + evalueer alle vereist in start-state en na synthetische spelstanden
let n=0,fouten=0;
function alleVereist(f){C.kaarten.forEach(k=>k.doelen&&Object.keys(k.doelen).forEach(e=>k.doelen[e].forEach(d=>d.vereist&&f(k,e,d))));}
alleVereist((k,e,d)=>{
  const ep=C.episodes.find(x=>x.id===e);
  try{P.valideer(d.vereist,C,ep);n++;}catch(x){fouten++;console.log('VALIDEER-FOUT',k.id,e,d.id,x.message);}
  const st=E.nieuwSpel(C,e,{rng:()=>0.1});
  try{P.evalueer(d.vereist,P.maakContext(C,ep,st));n++;}catch(x){fouten++;console.log('EVAL-FOUT',k.id,e,d.id,x.message);}
});
console.log('vereist gevalideerd/geëvalueerd',n,'fouten',fouten);
// startbeschikbaarheid per doelkaart/ doel via Engine.speelKaart in verse state (klonen via nieuwSpel)
function probeer(e,kaart,doel,optie,voor){
  const st=E.nieuwSpel(C,e,{rng:()=>0.1});
  (voor||[]).forEach(v=>{const r=E.speelKaart(st,v[0],{doel:v[1],optie:v[2]});if(!r.ok)throw new Error('voorzet faalt '+v+': '+r.fout);if(st.actiesOver<1)E.volgendeDag(st);});
  const r=E.speelKaart(st,kaart,{doel,optie});return r.ok?'OK':'NEE('+r.fout+')';
}
module.exports={C,P,E,probeer,sb};
if(require.main===module){
 console.log('--- begin-stand: welke doelen worden geaccepteerd (verse state)');
 ['V6','B1','B2','B3','B5','B4','N2','Ev2'].forEach(id=>{const k=C.kaarten.find(x=>x.id===id);Object.keys(k.doelen).forEach(e=>{
   console.log(id,e,k.doelen[e].map(d=>d.id+':'+probeer(e,id,d.id,id==='V6'?(k.opties[d.id]||[{tekst:'x'}])[0].tekst:null).slice(0,2)).join('  '));});});
}
