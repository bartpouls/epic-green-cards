// Eigen orakel (uit contract 3b + LEAD-beslissing), onafhankelijk van engine.js. Gebruik: node fuzz.js [N]
const {laad}=require("./laad.js");
const sb=laad();const E=sb.Engine,casus=sb.CASUSSEN[0];
let seed=+process.argv[3]||12345;function R(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const ri=n=>Math.floor(R()*n);
const N=+process.argv[2]||5000;
const J=x=>JSON.stringify(x);
function orakel(ep,rng0){
  const o={ep,dag:1,tl:[],wacht:[],geb:[],toest:ep.startToestanden.slice(),res:[],gev:[],kl:{1:null},sticky:false,eerstePeriodeGehad:false,voorbij:false};
  return o;
}
function actEinde(o,d){
  const R_=casus.rollen,ab=o.ep.antibiotica,act=new Set();
  for(const r of o.tl){if(r.dag>d)continue;
    if(r.kaart===R_.wissel){if(r.doel!=null){ab.forEach(x=>act.delete(x));act.add(r.doel);}}
    else if(r.kaart===R_.stop){if(r.doel!=null)act.delete(r.doel);}
    else if(ab.includes(r.kaart))act.add(r.kaart);}
  return ab.filter(x=>act.has(x));
}
function werkzaam(o,act,st){
  let entry=null;for(const k of Object.keys(o.ep.werkzaamheid)){if(k==="statusTeksten"||k.startsWith("TODO_BART"))continue;if(o.toest.includes(k))entry=o.ep.werkzaamheid[k];}
  if(!entry)return false;
  const ctx=sb.Predicaten.maakContext(casus,o.ep,st);
  return act.some(a=>entry.werkzaam.some(w=>w.kaart===a&&(!w.als||sb.Predicaten.evalueer(w.als,ctx))));
}
function eersteVolg(o,k){const r=o.tl.find(r=>r.kaart===k);return r?r.volg:null;}
function trigVan(o,e,orde){
  if(!e.groep)return e.trigger;
  const leden=o.ep.gebeurtenissen.map((x,i)=>({x,i})).filter(z=>z.x.groep===e.groep);
  leden.sort((a,b)=>(a.x.trigger.n-b.x.trigger.n)||(a.i-b.i));
  return leden[orde[e.groep].indexOf(e.id)].x.trigger;
}
const rapport=[];
let nietTerug=0,spellen=0,afwijk=0,geenV=0,randgevallen=0;
for(let g=0;g<N;g++){
  const ep=casus.episodes[ri(3)];
  const rngw=R()<0.3?[0,0.99,0.5][ri(3)]:R();
  const s=E.nieuwSpel(casus,ep.id,{rng:()=>rngw});
  const o=orakel(ep);
  // orde: groepen uit state (check permutatie)
  const orde={};const gr={};ep.gebeurtenissen.forEach(e=>{if(e.groep)(gr[e.groep]=gr[e.groep]||[]).push(e.id);});
  for(const k in gr){orde[k]=(s.groepen||{})[k];if(!orde[k]||J(orde[k].slice().sort())!==J(gr[k].slice().sort()))throw new Error("groep geen permutatie "+J(orde[k]));}
  const stap=10+ri(process.env.BIAS?90:50);
  const log=[];
  try{
  for(let i=0;i<stap;i++){
    const x=R();
    if(x<(process.env.BIAS?0.7:0.55)){
      const pool=process.env.BIAS?['V4','V8','V7','V3','B1','B2','B2','B1','B4','B3','O1','N1','V5'].filter(z=>ep.repertoire.includes(z)):ep.repertoire;const k=pool[ri(pool.length)];
      const kaart=casus.kaarten.find(c=>c.id===k);
      let opts={};const doelen=kaart.doelen&&kaart.doelen[ep.id];
      if(doelen&&R()<0.9){const d=doelen[ri(doelen.length)];opts.doel=d.id;}
      if(kaart.opties){const od=kaart.opties[opts.doel]||[];if(od.length&&R()<0.9){const op=od[ri(od.length)];opts.optie=typeof op==="string"?op:op.tekst;}}
      const voor=J(s);
      const r=E.speelKaart(s,k,opts);
      if(!r.ok){if(J(s)!==voor)throw new Error("state veranderd bij geweigerde zet");continue;}
      const regel={volg:o.tl.length+1,kaart:k,dag:o.dag,doel:opts.doel==null?null:opts.doel,optie:opts.optie==null?null:opts.optie};
      o.tl.push(regel);log.push("K "+k);
      for(const e of ep.gebeurtenissen){
        if(o.geb.some(z=>z.id===e.id)||o.wacht.some(z=>z.id===e.id))continue;
        const t=trigVan(o,e,orde);
        if(t.alleenAlsGespeeld&&eersteVolg(o,t.alleenAlsGespeeld)==null)continue;
        let hit=false;
        if(t.type==="naKaart"||t.type==="naAantalKaarten")hit=regel.volg===t.n;
        else if(t.type==="naKaartVanKaart"){const f=eersteVolg(o,t.kaart);hit=f!=null&&regel.volg===f+t.n;}
        if(hit)o.wacht.push({id:e.id,naVolg:regel.volg});
      }
    } else if(true){
      if(R()<(process.env.BIAS?0.05:0.35) && o.dag<ep.knoppen.aantalDagen) continue;
      log.push("D");
      if(o.voorbij){let thrown=false;try{E.volgendeDag(s);}catch(e){thrown=true;}if(!thrown)throw new Error("volgendeDag na einde gooit niet");continue;}
      E.volgendeDag(s);
      if(o.dag>=ep.knoppen.aantalDagen){o.voorbij=true;continue;}
      const nd=o.dag+1;
      for(const w of o.wacht){const def=ep.gebeurtenissen.find(z=>z.id===w.id);o.geb.push({id:w.id,dag:nd,naVolg:w.naVolg});
        [].concat(def.toestand||[]).forEach(t=>{if(!o.toest.includes(t))o.toest.push(t);});
        if(def.zet){(def.zet.resistent||[]).forEach(m=>{if(!o.res.includes(m))o.res.push(m);const q=o.gev.indexOf(m);if(q>=0)o.gev.splice(q,1);});
          (def.zet.gevoelig||[]).forEach(m=>{if(!o.gev.includes(m))o.gev.push(m);const q=o.res.indexOf(m);if(q>=0)o.res.splice(q,1);});}}
      o.wacht=[];o.dag=nd;
      const act=actEinde(o,nd-1);
      const st=J({tijdlijn:o.tl,gebeurtenissen:o.geb,toestanden:o.toest,dag:nd,aantalDagen:ep.knoppen.aantalDagen,klachten:Object.keys(o.kl).map(d=>({dag:+d,status:o.kl[d]}))});
      const werk=werkzaam(o,act,JSON.parse(st));
      let status;
      // geenVerbetering48 start: gebeurtenis met statusNaBeurten n op dag dA, d = dA+n, en niet werkzaam aan eind van d-1 (=dA+n-1)
      let inPeriode=false;
      if(!werk){
        if(o.sticky) inPeriode=true;
        else if(!o.periodeGehad){
          for(const gb of o.geb){const def=ep.gebeurtenissen.find(z=>z.id===gb.id);const n=def.zet&&def.zet.statusNaBeurten;if(n&&nd===gb.dag+n)inPeriode=true;}
        }
      }
      if(inPeriode){o.sticky=true;o.periodeGehad=true;status="geenVerbetering48";geenV++;}
      else{ if(!werk&&o.periodeGehad&&!o.sticky)nietTerug++; if(o.sticky){o.sticky=false;randgevallen++;} status=act.length?(werk?"af":"aan"):null; }
      o.kl[nd]=status;
      const eng=s.klachten[nd];
      const tx=ep.statusTeksten||{};
      const tekstVerw=status&&tx[status]!=null?tx[status]:null;
      if(!eng||eng.status!==status||eng.dag!==nd||eng.tekst!==tekstVerw)throw new Error("klachtenstatus dag "+nd+": engine "+J(eng)+" orakel "+status);
    }
  }
  // vergelijk eindstand
  if(J(s.tijdlijn)!==J(o.tl))throw new Error("tijdlijn verschilt");
  if(J(s.gebeurtenissen)!==J(o.geb))throw new Error("gebeurtenissen: "+J(s.gebeurtenissen)+" vs "+J(o.geb));
  if(J(s.wachtend.map(w=>w.id))!==J(o.wacht.map(w=>w.id)))throw new Error("wachtend verschilt "+J(s.wachtend)+J(o.wacht));
  if(J(s.sets.resistent.slice().sort())!==J(o.res.slice().sort())||J(s.sets.gevoelig.slice().sort())!==J(o.gev.slice().sort()))throw new Error("sets verschillen");
  if(s.dag!==o.dag)throw new Error("dag");
  if(J(s.toestanden)!==J(o.toest))throw new Error("toestanden "+J(s.toestanden)+J(o.toest));
  if(E.eindeBereikt(s)!==o.voorbij)throw new Error("eindeBereikt");
  }catch(e){afwijk++;if(rapport.length<8)rapport.push(ep.id+" seed-spel "+g+": "+e.message+" log="+log.join(","));}
  spellen++;
}
console.log({spellen,afwijk,geenVerbetering48_dagen:geenV,randgevallen_na_periode:randgevallen,dagen_na_periode_zonder_werkzaam_geen_terugkeer:nietTerug});
rapport.forEach(r=>console.log(r));
