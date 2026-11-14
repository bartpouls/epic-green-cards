// Eigen orakel voor klachtenstatus (contract 3b) en gebeurtenissen; geschreven uit het contract, niet uit engine.js.
const J=x=>JSON.parse(JSON.stringify(x));
function maakOrakel(sb,casus,epId,groepVolgorde){
  const ep=casus.episodes.find(e=>e.id===epId);
  const o={casus,ep,dag:1,acties:ep.knoppen.actiesPerBeurt,tijdlijn:[],raadpl:0,geb:[],wacht:[],toest:ep.startToestanden.slice(),
    res:[],gev:[],klachten:{1:{status:null}},voorbij:false,afgerond:false,onthuld:[],orde:groepVolgorde};
  return o;
}
// trigger-toewijzing: leden van een groep gesorteerd op n, toegekend in getrokken volgorde
function triggerVan(o,e){
  if(!e.groep) return e.trigger;
  const leden=o.ep.gebeurtenissen.filter(x=>x.groep===e.groep).map((x,i)=>({x,i}));
  leden.sort((a,b)=>(a.x.trigger.n-b.x.trigger.n)||(a.i-b.i));
  const pos=o.orde[e.groep].indexOf(e.id);
  return leden[pos].x.trigger;
}
function eersteVolg(o,k){const r=o.tijdlijn.find(r=>r.kaart===k);return r?r.volg:null;}
function naSpelen(o){
  const v=o.tijdlijn.length;
  for(const e of o.ep.gebeurtenissen){
    if(o.geb.some(x=>x.id===e.id)||o.wacht.some(x=>x.id===e.id)) continue;
    const t=triggerVan(o,e);
    if(t.alleenAlsGespeeld && eersteVolg(o,t.alleenAlsGespeeld)==null) continue;
    let hit=false;
    if(t.type==="naKaart"||t.type==="naAantalKaarten") hit=(v===t.n);
    else if(t.type==="naKaartVanKaart"){const f=eersteVolg(o,t.kaart);hit=f!=null&&v===f+t.n;}
    if(hit) o.wacht.push({id:e.id,naVolg:v});
  }
}
function actiefEinde(o,d){
  const ab=o.ep.antibiotica,act=new Set(),R=o.casus.rollen;
  for(const r of o.tijdlijn){ if(r.dag>d) continue;
    if(r.kaart===R.wissel){ if(r.doel!=null){ab.forEach(x=>act.delete(x));act.add(r.doel);} }
    else if(r.kaart===R.stop){ if(r.doel!=null) act.delete(r.doel); }
    else if(ab.includes(r.kaart)) act.add(r.kaart);
  }
  return [...act];
}
function werkzaam(o,sb,d){
  const act=actiefEinde(o,d);
  // werkzaamheidstabel van de huidige toestand: laatste sleutel in datavolgorde die actief is
  const w=o.ep.werkzaamheid;let entry=null;
  for(const k of Object.keys(w)){ if(k==="statusTeksten"||k.indexOf("TODO_BART")===0) continue; if(o.toest.includes(k)) entry=w[k]; }
  const ctx=sb.Predicaten.maakContext(o.casus,o.ep,state(o));
  const ok=entry? act.some(a=>entry.werkzaam.some(x=>x.kaart===a&&(!x.als||sb.Predicaten.evalueer(x.als,ctx)))):false;
  return {act,ok};
}
function state(o){return {tijdlijn:o.tijdlijn,gebeurtenissen:o.geb,toestanden:o.toest,klachten:Object.keys(o.klachten).map(d=>({dag:+d,status:o.klachten[d].status})),dag:o.dag,aantalDagen:o.ep.knoppen.aantalDagen};}
function berekenStatus(o,sb,d){
  const prev=werkzaam(o,sb,d-1);
  o.werkHist=o.werkHist||{}; o.werkHist[d-1]=prev.ok;   // bevroren: werkzaamheid van het eind van d-1 zoals bekend op het moment dat dag d begint
  let geenV=false;
  for(const g of o.geb){ const def=o.ep.gebeurtenissen.find(x=>x.id===g.id); const n=def.zet&&def.zet.statusNaBeurten; if(!n) continue;
    if(d>=g.dag+n){ let alleNee=true; for(let e=g.dag+n-1;e<=d-1;e++) if(o.werkHist[e]) alleNee=false; if(alleNee) geenV=true; } }
  if(geenV) return "geenVerbetering48";
  if(!prev.act.length) return null;
  return prev.ok?"af":"aan";
}
function volgendeDag(o,sb){
  if(o.dag>=o.ep.knoppen.aantalDagen){o.voorbij=true;return;}
  const nd=o.dag+1;
  for(const w of o.wacht){const def=o.ep.gebeurtenissen.find(x=>x.id===w.id);
    o.geb.push({id:w.id,dag:nd,naVolg:w.naVolg});
    if(def.toestand) [].concat(def.toestand).forEach(t=>{if(!o.toest.includes(t)) o.toest.push(t);});
    if(def.zet){ (def.zet.resistent||[]).forEach(m=>{if(!o.res.includes(m)) o.res.push(m);});
      (def.zet.gevoelig||[]).forEach(m=>{if(!o.gev.includes(m)) o.gev.push(m); const i=o.res.indexOf(m); if(i>=0) o.res.splice(i,1);}); } }
  o.wacht=[];
  o.dag=nd;o.acties=o.ep.knoppen.actiesPerBeurt;
  const st=berekenStatus(o,sb,nd);
  const tx=o.ep.statusTeksten||{};
  o.klachten[nd]={status:st,tekst:st&&tx[st]!=null?tx[st]:null};
}
module.exports={maakOrakel,naSpelen,volgendeDag,state,actiefEinde};
