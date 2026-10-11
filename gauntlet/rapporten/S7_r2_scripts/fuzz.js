const {laad}=require("./load.js");
const engineSrc=process.argv[2]?require("fs").readFileSync(process.argv[2],"utf8"):null;
const sb=laad(engineSrc);const c=sb.CASUSSEN[0];const E=sb.Engine;
function mk(seed){let s=seed;return ()=>{s=(s*16807)%2147483647;return s/2147483647;}}
const rl=c.rollen;
function oracle(state,ep){
  // onafhankelijke berekening van klachtenstatus per dag uit tijdlijn + gebeurtenissen + data (contract 3b)
  const res=[];const abs=ep.antibiotica;
  function actiefEinde(x){let act=new Set();
    state.tijdlijn.filter(r=>r.dag<=x).forEach(r=>{
      if(r.kaart===rl.wissel){abs.forEach(a=>act.delete(a));act.add(r.doel);}
      else if(r.kaart===rl.stop){act.delete(r.doel);}
      else if(abs.includes(r.kaart)&&r.doel==null)act.add(r.kaart);
    });return [...act].filter(a=>abs.includes(a));}
  function toestandenOp(d){const t=new Set(ep.startToestanden);state.gebeurtenissen.filter(g=>g.dag<=d).forEach(g=>{const def=ep.gebeurtenissen.find(e=>e.id===g.id);if(def&&def.toestand)[].concat(def.toestand).forEach(x=>t.add(x));});return t;}
  let TOT=99;function gespeeldOoit(K){return state.tijdlijn.some(r=>r.dag<=TOT&&r.kaart===K.kaart&&(K.doel==null||r.doel===K.doel));}
  function ev(p){ if(!p)return true; if(p.p==="gespeeld")return gespeeldOoit(p.K||p); if(p.p==="of")return p.args.some(ev); if(p.p==="niet")return !ev(p.arg); if(p.p==="en")return p.args.every(ev); throw new Error("oracle kent "+p.p);}
  function werkzaamEinde(x,d){TOT=x;const t=toestandenOp(d);const keys=Object.keys(ep.werkzaamheid).filter(k=>!k.startsWith("TODO")&&k!=="statusTeksten"&&t.has(k));
    // geldende toestand = specifiekste: laatste in datavolgorde die actief is
    const k=keys[keys.length-1];if(!k)return false;const w=ep.werkzaamheid[k];
    return actiefEinde(x).some(a=>w.werkzaam.some(z=>z.kaart===a&&(!z.als||ev(z.als))));}
  const n=state.klachten.length-1;
  for(let d=1;d<=n;d++){
    if(d===1){res[d]=null;continue;}
    const act=actiefEinde(d-1);let st;
    // override
    let ov=false;
    state.gebeurtenissen.forEach(g=>{const def=ep.gebeurtenissen.find(e=>e.id===g.id);if(def&&def.zet&&def.zet.statusNaBeurten){const m=def.zet.statusNaBeurten;if(d>=g.dag+m){let alleLeeg=true;for(let x=g.dag+m-1;x<=d-1;x++){if(werkzaamEinde(x,x+1))alleLeeg=false;}if(alleLeeg)ov=true;}}});
    if(ov)st="geenVerbetering48";else if(!act.length)st=null;else st=werkzaamEinde(d-1,d)?"af":"aan";
    res[d]=st;}
  return res;
}
function evOracle(state,ep,volgorde){ // verwachte gebeurtenissen (id->naVolg) uit tijdlijn
  const out={};const t=state.tijdlijn;
  const o1=t.find(r=>r.kaart==="O1");
  ep.gebeurtenissen.forEach(def=>{let n=null;let tr=def.trigger;
    if(def.groep){const leden=ep.gebeurtenissen.filter(x=>x.groep===def.groep).map(x=>x.trigger.n).sort((a,b)=>a-b);n=leden[volgorde.indexOf(def.id)];}
    else if(tr.type==="naKaartVanKaart"){ if(o1) n=o1.volg+tr.n; else return;}
    else n=tr.n;
    if(tr.alleenAlsGespeeld){ const o=t.find(r=>r.kaart===tr.alleenAlsGespeeld); if(!o||o.volg>n)return;}
    if(t.length>=n) out[def.id]={naVolg:n,dag:t[n-1].dag+1};});
  return out;
}
let fouten=0,spellen=0,bereikt={};
const eps=process.argv[3]?process.argv[3].split(","):["E1","E2","E3"];
for(const epId of eps){const ep=c.episodes.find(e=>e.id===epId);
 for(let ronde=0;ronde<3000;ronde++){
  const rnd=mk(ronde*13+7);
  const s=E.nieuwSpel(c,epId,{rng:rnd});spellen++;
  const stratKaarten=ep.repertoire;
  for(let stap=0;stap<80&&!E.eindeBereikt(s);stap++){
    const kid=stratKaarten[Math.floor(rnd()*stratKaarten.length)];const kaart=c.kaarten.find(k=>k.id===kid);const opts={};
    const dl=kaart.doelen&&kaart.doelen[epId];
    if(dl){const d=dl[Math.floor(rnd()*dl.length)];opts.doel=d.id;if(kaart.opties){const o=kaart.opties[d.id]||[];if(o.length)opts.optie=(o[Math.floor(rnd()*o.length)]).tekst;}}
    const voor=JSON.stringify(s);const r=E.speelKaart(s,kid,opts);
    if(!r.ok&&JSON.stringify(s)!==voor){fouten++;console.log("MUTATIE bij fout",epId,ronde,kid,r.fout);}
    if(s.actiesOver<0){fouten++;console.log("negatief budget");}
    if(rnd()<0.1&&s.actiesOver>0){const rr=E.raadpleeg(s);}
    if(s.actiesOver===0||rnd()<0.25){ if(s.dag<s.aantalDagen||!s.dagenVoorbij) E.volgendeDag(s);}
  }
  while(!E.eindeBereikt(s))E.volgendeDag(s);
  // vergelijk
  const o=oracle(s,ep);
  for(let d=1;d<s.klachten.length;d++){ if(d>s.aantalDagen){fouten++;console.log("klachten voorbij einde",d);} if(s.klachten[d].status!==o[d]){fouten++;if(fouten<15)console.log("STATUS verschil",epId,ronde,"dag",d,"engine",s.klachten[d].status,"oracle",o[d],JSON.stringify(s.tijdlijn.map(r=>r.volg+r.kaart+(r.doel?":"+r.doel:"")+"@"+r.dag)),JSON.stringify(s.gebeurtenissen));}
    const tx=ep.statusTeksten[s.klachten[d].status];if(s.klachten[d].status&&s.klachten[d].tekst!==tx){fouten++;console.log("tekst verkeerd");}}
  const eo=evOracle(s,ep,s.groepen.AB||s.volgordeAB||[]);
  // beperk tot gebeurtenissen waarvan banner binnen speeldagen valt
  for(const id in eo){const e=eo[id];const g=s.gebeurtenissen.find(x=>x.id===id);
    if(e.dag<=s.aantalDagen){ if(!g||g.naVolg!==e.naVolg||g.dag!==e.dag){fouten++;if(fouten<15)console.log("GEB verschil",epId,ronde,id,JSON.stringify(e),JSON.stringify(g));} }
    else if(g){fouten++;console.log("gebeurtenis na einde toegepast",id);} }
  s.gebeurtenissen.forEach(g=>{if(!eo[g.id]){fouten++;console.log("onverwachte gebeurtenis",g.id,epId,ronde);}});
  Object.keys(eo).forEach(k=>bereikt[epId+k]=(bereikt[epId+k]||0)+1);
 }}
console.log("spellen",spellen,"fouten",fouten,JSON.stringify(bereikt));
