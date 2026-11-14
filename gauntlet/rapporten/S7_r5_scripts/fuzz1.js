// Fuzz: echte UWI-data, eigen orakel (onafhankelijk van engine.js; gebruikt alleen Predicaten voor data-predicaten)
require("./load.js");
const c0=CASUSSEN[0];
const N=+process.argv[2]||2000, SEED0=+process.argv[3]||1;
function lcg(z){z>>>=0;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}}
const J=x=>JSON.stringify(x);
const baseHash=J(c0);
let fouten=[],stats={spellen:0,stappen:0,geweigerd:0,geb:0,geenV48:0,randgeval:0,gap:0,afgerond:0,laatsteDagGeb:0};
function fail(m){fouten.push(m);if(fouten.length>30)throw new Error("te veel fouten")}
function fisher(ids,rng){const a=ids.slice(),n=a.length;for(let i=0;i<n-1;i++){const j=i+Math.floor(rng()*(n-i));[a[i],a[j]]=[a[j],a[i]]}return a}
for(let sp=0;sp<N;sp++){
 const seed=SEED0*100000+sp, r=lcg(seed*13+5), ep0=c0.episodes[process.env.EP?(+process.env.EP):sp%3];
 const rngE=lcg(seed), rngO=lcg(seed); // orakel krijgt eigen kopie van dezelfde stroom
 const opt={rng:rngE}; const pas=r()<0.15; if(pas)opt.afrondenPasNaGebeurtenissen=true;
 const s=Engine.nieuwSpel(c0,ep0.id,opt);
 const ep=ep0;
 // orakel
 const O={dag:1,acties:ep.knoppen.actiesPerBeurt,tl:[],wacht:[],geb:[],toest:ep.startToestanden.slice(),klach:{1:null},kltxt:{},gehad48:false,pariode:false,onthuld:[],ra:[],afgerond:false,voorbij:false};
 // groepen
 const groepen={},gids=[];ep.gebeurtenissen.forEach(e=>{if(!e.groep)return;(groepen[e.groep]=groepen[e.groep]||[]).push(e.id);if(!gids.includes(e.groep))gids.push(e.groep)});
 gids.forEach(g=>groepen[g]=fisher(groepen[g],rngO));
 if(J(s.groepen)!==J(groepen))fail("groepen verschillen "+J(s.groepen)+" "+J(groepen));
 if(groepen.AB&&J(s.volgordeAB)!==J(groepen.AB))fail("volgordeAB");
 function trigVan(e){ if(!e.groep)return e.trigger; const leden=ep.gebeurtenissen.filter(x=>x.groep===e.groep); const ts=leden.map((x,i)=>({t:x.trigger,i})).sort((a,b)=>(a.t.n-b.t.n)||(a.i-b.i)); return ts[groepen[e.groep].indexOf(e.id)].t}
 function volgVan(k){const x=O.tl.find(t=>t.kaart===k);return x?x.volg:null}
 function actiefEind(d){ // antibiotica actief aan einde van dag d
   let act=[]; for(const t of O.tl){ if(t.dag>d)continue;
     if(ep.antibiotica.includes(t.kaart)) {if(!act.includes(t.kaart))act.push(t.kaart)}
     else if(t.kaart===c0.rollen.wissel){ act=[t.doel] }
     else if(t.kaart===c0.rollen.stop){ act=act.filter(x=>x!==t.doel) } }
   return act}
 function wzEntry(){const w=ep.werkzaamheid;const ks=Object.keys(w).filter(k=>k!=="statusTeksten"&&!k.startsWith("TODO_BART"));for(let i=ks.length-1;i>=0;i--)if(O.toest.includes(ks[i]))return w[ks[i]];return null}
 function werkzaamEind(d){const act=actiefEind(d),e=wzEntry();if(!e)return{act,wz:false};
   const ctx=Predicaten.maakContext(c0,ep,s);
   return{act,wz:act.some(k=>e.werkzaam.some(w=>w.kaart===k&&(!w.als||Predicaten.evalueer(w.als,ctx))))}}
 function vergelijk(wat){
  const ex={dag:O.dag,actiesOver:O.acties,afgerond:O.afgerond,dagenVoorbij:O.voorbij};
  for(const k in ex) if(s[k]!==ex[k]) fail(`spel ${seed} ${ep.id} na ${wat}: ${k} engine=${s[k]} orakel=${ex[k]}`);
  const tl=O.tl.map(t=>({volg:t.volg,kaart:t.kaart,dag:t.dag,doel:t.doel,optie:t.optie}));
  if(J(s.tijdlijn)!==J(tl))fail(`spel ${seed} na ${wat}: tijdlijn`);
  if(J(s.gebeurtenissen)!==J(O.geb))fail(`spel ${seed} ${ep.id} na ${wat}: gebeurtenissen engine=${J(s.gebeurtenissen)} orakel=${J(O.geb)}`);
  if(J(s.wachtend.map(w=>({id:w.id,naVolg:w.naVolg})))!==J(O.wacht.map(w=>({id:w.id,naVolg:w.naVolg}))))fail(`spel ${seed} na ${wat}: wachtend`);
  if(J(s.toestanden)!==J(O.toest))fail(`spel ${seed} na ${wat}: toestanden ${J(s.toestanden)} vs ${J(O.toest)}`);
  for(let d=1;d<=O.dag;d++){ if(!s.klachten[d]||s.klachten[d].status!==O.klach[d])fail(`spel ${seed} ${ep.id} na ${wat}: klachten[${d}] engine=${s.klachten[d]&&s.klachten[d].status} orakel=${O.klach[d]}`); }
  if(s.klachten.length!==O.dag+1)fail(`klachten.length ${s.klachten.length} dag ${O.dag}`);
  if(J(s.raadplegingen)!==J(O.ra))fail("raadplegingen");
  if(J(s.onthuld.map(o=>[o.kaart,o.dag,o.sleutel,o.tekst]))!==J(O.onthuld.map(o=>[o.kaart,o.dag,o.sleutel,o.tekst])))fail("onthuld "+wat);
  if(J(s.sets.resistent.slice().sort())!==J(O.res.slice().sort()))fail(`sets.resistent na ${wat}`);
  if(J(s.sets.gevoelig.slice().sort())!==J(O.gev.slice().sort()))fail(`sets.gevoelig na ${wat}`);
  if(J(ep.patient.waar)!==J(WAAR))fail("waar gewijzigd");
  if(J(c0)!==baseHash)fail("casus gemuteerd");
 }
 const WAAR=J(ep.patient.waar)&&JSON.parse(J(ep.patient.waar));
 O.res=[];O.gev=[];
 function oracleKlachten(d){ // status voor dag d (>=2)
   const v=werkzaamEind(d-1);
   let periode=false;
   // gebeurtenis(sen) met statusNaBeurten, in volgorde van activering; alleen EERSTE nul-periode
   const vorig=O.klach[d-1];
   let gehad=false;for(let i=2;i<d;i++)if(O.klach[i]==="geenVerbetering48")gehad=true;
   if(!v.wz){
     if(gehad)periode=(vorig==="geenVerbetering48");
     else for(const gb of O.geb){const def=ep.gebeurtenissen.find(x=>x.id===gb.id);if(def&&def.zet&&def.zet.statusNaBeurten&&d===gb.dag+def.zet.statusNaBeurten)periode=true}
   }
   if(!v.wz&&gehad&&!periode)stats.randgeval++;
   if(periode){stats.geenV48++;return"geenVerbetering48"}
   if(!v.act.length)return null; return v.wz?"af":"aan"}
 vergelijk("start");
 const kaarten=process.env.POOL?process.env.POOL.split(",").filter(x=>ep.repertoire.includes(x)).concat(["ONBEKEND"]):ep.repertoire.concat(["ONBEKEND","V1"]);
 let k=0;
 for(let stap=0;stap<90&&!O.afgerond&&!O.voorbij;stap++){
  const w=r();
  stats.stappen++;
  if(w<(+process.env.PDAG||0.20)){ // volgende dag
    if(O.dag>=ep.knoppen.aantalDagen){ Engine.volgendeDag(s); O.voorbij=true; if(O.wacht.length)stats.laatsteDagGeb++; if(O.wacht.length&&s.gebeurtenissen.length!==O.geb.length)fail("laatste dag toonde gebeurtenis"); vergelijk("laatste volgendeDag"); continue}
    const ret=Engine.volgendeDag(s); if(ret!==s)fail("volgendeDag geeft state niet terug");
    const nd=O.dag+1;
    O.wacht.forEach(wt=>{O.geb.push({id:wt.id,dag:nd,naVolg:wt.naVolg});const def=ep.gebeurtenissen.find(x=>x.id===wt.id);
      (def.toestand==null?[]:[].concat(def.toestand)).forEach(t=>{if(!O.toest.includes(t))O.toest.push(t)});
      if(def.zet){(def.zet.resistent||[]).forEach(m=>{if(!O.res.includes(m))O.res.push(m)});(def.zet.gevoelig||[]).forEach(m=>{if(!O.gev.includes(m))O.gev.push(m);const ix=O.res.indexOf(m);if(ix>=0)O.res.splice(ix,1)})}});
    if(O.wacht.length)stats.geb++;
    O.wacht=[];O.dag=nd;O.acties=ep.knoppen.actiesPerBeurt;O.klach[nd]=oracleKlachten(nd);
    vergelijk("volgendeDag");
  } else if(w<0.27){
    const kost=ep.knoppen.raadplegenKost||0; const okv=O.acties>=kost;
    let res; try{res=Engine.raadpleeg(s)}catch(e){fail("raadpleeg gooit "+e.message);continue}
    if(res.ok!==okv)fail(`raadpleeg ok=${res.ok} verwacht ${okv}`);
    if(okv){O.acties-=kost;O.ra.push({dag:O.dag})}else stats.geweigerd++;
    vergelijk("raadpleeg");
  } else if(w<0.30 && !pas){
    // vroeg afronden
    const res=Engine.rondAf(s); O.afgerond=true; stats.afgerond++; vergelijk("rondAf");
    if(s.uitkomst!==res)fail("uitkomst niet bewaard"); J(res);
    if(Engine.rondAf(s)!==res)fail("tweede rondAf geeft andere uitkomst"); if(!Engine.eindeBereikt(s))fail("eindeBereikt");
  } else {
    // kaart spelen
    const kid=kaarten[Math.floor(r()*kaarten.length)]; const kd=c0.kaarten.find(x=>x.id===kid);
    let o={};
    if(kd){const dl=(kd.doelen&&kd.doelen[ep.id])||[]; if(dl.length&&r()<0.92)o.doel=dl[Math.floor(r()*dl.length)].id; else if(r()<0.1)o.doel="lisinopril";
      if(kd.opties&&o.doel!=null&&kd.opties[o.doel]&&r()<0.9){const ol=kd.opties[o.doel];o.optie=ol[Math.floor(r()*ol.length)].tekst}
      else if(r()<0.04)o.optie="halveren"; if(!(kd.doelkaart||kd.doelen||kd.opties)&&r()<0.04)o.doel="V5"}
    // verwacht oordeel
    let verw=true;
    if(O.afgerond||O.voorbij||!kd||!ep.repertoire.includes(kid)||O.acties<1)verw=false;
    else{ const dl=kd.doelen&&kd.doelen[ep.id]; const dk=!!kd.doelkaart||!!dl||!!kd.opties;
      if(!dk){ if(o.doel!=null||o.optie!=null)verw=false }
      else { const toeg=dl?dl.map(x=>x.id):(kd.opties?Object.keys(kd.opties):[]);
        if(!toeg.length||o.doel==null||!toeg.includes(o.doel))verw=false;
        else{ const d=dl&&dl.find(x=>x.id===o.doel); if(d&&d.vereist&&!Predicaten.evalueer(d.vereist,Predicaten.maakContext(c0,ep,s)))verw=false;
          if(verw){ if(kd.opties){const ol=kd.opties[o.doel]||[]; if(!ol.length||o.optie==null||!ol.some(x=>(typeof x==="string"?x:x.tekst)===o.optie))verw=false} else if(o.optie!=null)verw=false } } } }
    const voor=J(s);
    const res=Engine.speelKaart(s,kid,o);
    if(res.ok!==verw)fail(`spel ${seed} ${ep.id}: speelKaart ${kid} ${J(o)} ok=${res.ok} verwacht ${verw} (${res.fout}) dag ${O.dag} acties ${O.acties}`);
    if(!res.ok){stats.geweigerd++; if(J(s)!==voor)fail("state veranderd na geweigerde zet"); }
    else{ const volg=O.tl.length+1; O.tl.push({volg,kaart:kid,dag:O.dag,doel:o.doel==null?null:o.doel,optie:o.optie==null?null:o.optie}); O.acties--;
      (ep.patient.verborgen||[]).forEach(v=>{if(v.kaart!==kid)return;if(O.onthuld.some(x=>x.kaart===kid&&x.tekst===v.onthult&&x.sleutel===(v.sleutel||null)))return;O.onthuld.push({kaart:kid,dag:O.dag,sleutel:v.sleutel||null,tekst:v.onthult})});
      ep.gebeurtenissen.forEach(e=>{ if(O.geb.some(x=>x.id===e.id)||O.wacht.some(x=>x.id===e.id))return; const t=trigVan(e);
        if(t.alleenAlsGespeeld&&volgVan(t.alleenAlsGespeeld)==null)return; let hit=false;
        if(t.type==="naKaart"||t.type==="naAantalKaarten")hit=(volg===t.n); else if(t.type==="naKaartVanKaart"){const v0=volgVan(t.kaart);hit=v0!=null&&volg===v0+t.n}
        if(hit)O.wacht.push({id:e.id,naVolg:volg})});
      // onthulling mag pas NA de kaart zichtbaar zijn
    }
    vergelijk("kaart "+kid);
  }
 }
 // eindcontrole: rondAf op eind
 if(!O.afgerond){ let blok=false; try{const res=Engine.rondAf(s); O.afgerond=true; stats.afgerond++; J(res)}catch(e){ blok=true; if(!(pas&&!O.voorbij&&!ep.gebeurtenissen.every(e=>O.geb.some(x=>x.id===e.id))))fail("rondAf gooit onverwacht: "+e.message); vergelijk("rondAf geblokkeerd")}
   if(!blok&&pas&&!O.voorbij&&!ep.gebeurtenissen.every(e=>O.geb.some(x=>x.id===e.id)))fail("rondAf zou geblokkeerd moeten zijn (opt-in)");
 }
 stats.spellen++;
}
console.log(J(stats));console.log(fouten.length?fouten.slice(0,10).join("\n"):"GEEN AFWIJKINGEN");
