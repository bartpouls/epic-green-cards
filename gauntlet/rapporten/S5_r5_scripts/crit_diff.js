// criticus r5: differentieel testen. Onafhankelijke referentie-interpreter (uit contract + PREDICATEN.md geschreven)
// tegen Predicaten.evalueer, voor alle 385 predicaten van de casus over random Engine-spelstanden.
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten,E=Engine,casus=CASUSSEN[0];
function ref(p,st,ep){
  const tl=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  const evs=st.gebeurtenissen;
  const evDag=id=>{const e=evs.find(x=>x.id===id);return e?e.dag:undefined;};
  const R=casus.rollen, ab=ep.antibiotica;
  function Kvan(o){const K={};["kaart","kaartUit","start","doel","optie","optieNiet","naGebeurtenis","voorGebeurtenis"].forEach(k=>{if(k in o)K[k]=o[k];});return K;}
  const arr=x=>Array.isArray(x)?x:[x];
  function m(K,l){
    if("kaart" in K&&!arr(K.kaart).includes(l.kaart))return false;
    if("kaartUit" in K&&!ep[K.kaartUit].includes(l.kaart))return false;
    if("start" in K){const s=arr(K.start);if(!(s.includes(l.kaart)||(l.kaart===R.wissel&&s.includes(l.doel))))return false;}
    if("doel" in K&&(l.doel??null)!==K.doel)return false;
    if("optie" in K&&(l.optie??null)!==K.optie)return false;
    if("optieNiet" in K&&arr(K.optieNiet).includes(l.optie??null)&&K.optieNiet.length)return false;
    if("naGebeurtenis" in K){const d=evDag(K.naGebeurtenis);if(d===undefined||l.dag<d)return false;}
    if("voorGebeurtenis" in K){const d=evDag(K.voorGebeurtenis);if(d!==undefined&&l.dag>=d)return false;}
    return true;}
  const KK=(o,v)=>v==="K"?(o.K?o.K:Kvan(o)):o[v];
  const all=K=>tl.filter(l=>m(K,l));
  function sim(maxDag,maxVolg){const act=new Set(),pa=new Set();let mx=0;
    for(const l of tl){ if(maxDag!==undefined&&l.dag>maxDag)continue; if(maxVolg!==undefined&&l.volg>maxVolg)continue;
      if(l.kaart===R.wissel){if(l.doel!=null){ab.forEach(a=>act.delete(a));act.add(l.doel);}}
      else if(l.kaart===R.stop){if(l.doel!=null)act.delete(l.doel);}
      else if(l.kaart===R.pauzeer){if(l.doel!=null)pa.add(l.doel);}
      else if(l.kaart===R.hervat){if(l.doel!=null)pa.delete(l.doel);}
      else if(ab.includes(l.kaart))act.add(l.kaart);
      mx=Math.max(mx,ab.filter(a=>act.has(a)).length);}
    return {act,pa,mx};}
  function mom(op){ if(op===undefined)return {};
    if(op.dag!==undefined)return {d:op.dag};
    if(op.eindeBeurtNaGebeurtenis!==undefined){const d=evDag(op.eindeBeurtNaGebeurtenis);return d===undefined?null:{d:d+(op.offset||0)};}
    const f=all(KK({K:op.naKaart},"K"))[0];return f?{d:f.dag,v:f.volg}:null;}
  function set(naam,md){const s=new Set((ep.patient.waar[naam]||ep[naam]||[]));
    for(const e of evs){if(md!==undefined&&e.dag>md)continue;const def=ep.gebeurtenissen.find(x=>x.id===e.id);if(!def||!def.zet)continue;
      if(def.zet[naam])arr(def.zet[naam]).forEach(x=>s.add(x));
      const tg={resistent:"gevoelig",gevoelig:"resistent"}[naam];if(tg&&def.zet[tg])arr(def.zet[tg]).forEach(x=>s.delete(x));}
    return s;}
  const cmp=(o,a,b)=>({"<":a<b,"<=":a<=b,">":a>b,">=":a>=b,"==":a===b,"=":a===b,"!=":a!==b})[o];
  const kl=d=>{const k=st.klachten.find(x=>x&&x.dag===d);return k?k.status:null;};
  let laatste=Math.max(1,st.dag,...tl.map(l=>l.dag),...st.klachten.filter(Boolean).map(k=>k.dag));
  const T={gespeeld:(t)=>all(KK(t,"K")).filter(l=>t.terwijlKlachten===undefined||kl(l.dag)===t.terwijlKlachten).length,aantalActieveAntibiotica:()=>sim().mx};
  switch(p.p){
   case"gespeeld":return all(KK(p,"K")).length>0;
   case"nietGespeeld":return all(KK(p,"K")).length===0;
   case"voor":{const a=all(p.a)[0],b=all(p.b)[0];return !!(a&&b&&a.volg<b.volg);}
   case"na":{const a=all(p.a)[0],b=all(p.b)[0];return !!(a&&b&&a.volg>b.volg);}
   case"binnenBeurten":{const d=evDag(p.naGebeurtenis);if(d===undefined)return false;return all(KK(p,"K")).some(l=>l.dag>=d&&l.dag<=d+p.n-1);}
   case"opDagRelatief":{const a=all(p.anker)[0];if(!a)return false;return all(KK(p,"K")).some(l=>l.dag-a.dag>=p.van&&(p.tot===undefined||l.dag-a.dag<=p.tot));}
   case"gestart":return tl.some(l=>arr(p.middel).includes(l.kaart)||(l.kaart===R.wissel&&arr(p.middel).includes(l.doel)));
   case"actief":{const mo=mom(p.op);if(mo===null)return false;const s=sim(mo.d,mo.v);const set_=p.uitSet?set(p.uitSet,mo.d):null;
     return (p.middel!==undefined?arr(p.middel):ab).some(a=>s.act.has(a)&&(!set_||set_.has(a)));}
   case"aantalActieveAntibiotica":return cmp(p.op,sim().mx,p.n);
   case"medicatieActief":{const mo=mom(p.op);if(mo===null)return false;return !sim(mo.d,mo.v).pa.has(p.id);}
   case"waar":return cmp(p.op,ep.patient.waar[p.veld],p.waarde);
   case"inToestand":return st.toestanden.includes(p.t);
   case"gebeurtenisGeweest":return evDag(p.id)!==undefined;
   case"klachten":{if(p.op===undefined)return st.klachten.some(k=>k&&k.status===p.waarde);
     if(p.op==="laatste")return kl(laatste)===p.waarde;
     const d=p.op.dag!==undefined?p.op.dag:(evDag(p.op.eindeBeurtNaGebeurtenis)===undefined?undefined:evDag(p.op.eindeBeurtNaGebeurtenis)+(p.op.offset||0));
     return d!==undefined&&kl(d)===p.waarde;}
   case"tel":return cmp(p.op,T[p.teller.t](p.teller),p.waarde);
   case"en":return p.args.every(a=>ref(a,st,ep));
   case"of":return p.args.some(a=>ref(a,st,ep));
   case"niet":return !ref(p.arg,st,ep);
   case"alsDan":return !ref(p.als,st,ep)||ref(p.dan,st,ep);
   case"waarheid":return p.waarde;
  }
  throw new Error("ref: onbekend "+p.p);
}
// ook tellers
const alle=[],tellers=[];
function walk(o,epi){ if(Array.isArray(o))o.forEach(x=>walk(x,epi)); else if(o&&typeof o==="object"){ if(typeof o.p==="string")alle.push({o,epi}); if(o.perKeer)tellers.push({o:o.perKeer,epi});
 Object.keys(o).forEach(k=>walk(o[k],(!epi&&/^E[123]$/.test(k))?k:epi));}}
walk(casus.kaarten,null);casus.episodes.forEach(e=>walk(e,e.id));
let seed=4242;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
let n=0,diff=0,waar=0;const perP={};
for(const ep of casus.episodes){for(let run=0;run<600;run++){
 const st=E.nieuwSpel(casus,ep.id,{rng:rnd});
 for(let s=0;s<45&&!E.eindeBereikt(st);s++){
  const k=ep.repertoire[Math.floor(rnd()*ep.repertoire.length)];const kaart=casus.kaarten.find(c=>c.id===k);const doelen=(kaart&&kaart.doelen&&kaart.doelen[ep.id])||[];const o={};
  if(doelen.length){const d=doelen[Math.floor(rnd()*doelen.length)];o.doel=d.id;}
  if(kaart&&kaart.opties&&o.doel){const ol=kaart.opties[o.doel]||[];if(ol.length){const x=ol[Math.floor(rnd()*ol.length)];o.optie=typeof x==="string"?x:x.tekst;}}
  if(rnd()<0.3)E.volgendeDag(st);else E.speelKaart(st,k,o);
  const ctx=P.maakContext(casus,ep.id,st);
  for(const x of alle){ if(x.epi&&x.epi!==ep.id)continue;
    const a=P.evalueer(x.o,ctx),b=ref(x.o,st,ep);n++;if(a)waar++;perP[x.o.p]=(perP[x.o.p]||0)+1;
    if(a!==b){diff++;if(diff<8)console.log("VERSCHIL",ep.id,JSON.stringify(x.o),a,b,JSON.stringify(st.tijdlijn.map(l=>[l.kaart,l.dag,l.doel,l.optie])));}}
  for(const x of tellers){ if(x.epi!==ep.id)continue; const a=P.tel(x.o,ctx); const b=ref({p:"tel",teller:x.o,op:">=",waarde:0},st,ep); }
 }}}
console.log("vergelijkingen",n,"waar",waar,"verschillen",diff,JSON.stringify(perP));
