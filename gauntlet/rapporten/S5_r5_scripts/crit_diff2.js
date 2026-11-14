// criticus r5: differentieel testen. Onafhankelijke referentie-interpreter (uit contract + PREDICATEN.md geschreven)
// tegen Predicaten.evalueer, voor alle 385 predicaten van de casus over random Engine-spelstanden.
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["regels/predicaten.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten;
let casus;
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

let seed=99;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
const pick=a=>a[Math.floor(rnd()*a.length)];
casus={rollen:{wissel:"R1",stop:"R2",pauzeer:"R3",hervat:"R4"}};
const ep={id:"S",antibiotica:["Q1","Q2","Q3"],reserve:["Q2"],patient:{waar:{w:5,s:"a"},medicatie:[{id:"m1"},{id:"m2"}]},resistent:["Q3"],
 gebeurtenissen:[{id:"A",zet:{resistent:["Q1"],gevoelig:["Q3"]}},{id:"B",zet:{gevoelig:["Q1"]}}]};casus.episodes=[ep];
const KS=["Q1","Q2","Q3","X","R1","R2","R3","R4"];
function rK(){const K={};const r=rnd();K.kaart=r<0.2?[pick(KS),pick(KS)]:pick(KS);
 if(rnd()<0.15){delete K.kaart;K.start=rnd()<0.5?pick(["Q1","Q2","Q3"]):[pick(["Q1","Q2"]),"Q3"];}
 if(rnd()<0.1){delete K.kaart;K.kaartUit=pick(["antibiotica","reserve"]);}
 if(rnd()<0.25)K.doel=pick([null,"Q1","Q2","m1","m2"]);if(rnd()<0.15)K.optie=pick([null,"h"]);if(rnd()<0.1)K.optieNiet=pick([[],["h"]]);
 if(rnd()<0.1)K.naGebeurtenis=pick(["A","B"]);if(rnd()<0.1)K.voorGebeurtenis=pick(["A","B"]);return K;}
function rMom(){const r=rnd();if(r<0.3)return undefined;if(r<0.55)return {dag:1+Math.floor(rnd()*5)};if(r<0.8)return {eindeBeurtNaGebeurtenis:pick(["A","B"]),offset:pick([undefined,0,1,2])};return {naKaart:rK()};}
function rP(d){const r=rnd();
 if(d>2||r<0.55){const k=pick(["gespeeld","nietGespeeld","voor","na","binnenBeurten","opDag","gestart","actief","aantal","med","waar","inT","geb","klachten","tel","waarheid"]);
  switch(k){case"gespeeld":case"nietGespeeld":{const K=rK();return rnd()<0.5?Object.assign({p:k},K):{p:k,K};}
   case"voor":case"na":return {p:k,a:rK(),b:rK()};
   case"binnenBeurten":{const K=rK();delete K.naGebeurtenis;return Object.assign({p:k,naGebeurtenis:pick(["A","B"]),n:Math.floor(rnd()*4)},K);}
   case"opDag":{const v=Math.floor(rnd()*3);const o={p:"opDagRelatief",K:rK(),anker:rK(),van:v};if(rnd()<0.7)o.tot=v+Math.floor(rnd()*3);return o;}
   case"gestart":return {p:k,middel:rnd()<0.5?pick(["Q1","Q2","Q3"]):["Q1","Q3"]};
   case"actief":{const o={p:"actief"};if(rnd()<0.6)o.middel=rnd()<0.7?pick(["Q1","Q2","Q3"]):["Q2","Q3"];const m=rMom();if(m)o.op=m;if(rnd()<0.3)o.uitSet=pick(["resistent","gevoelig","reserve"]);return o;}
   case"aantal":return {p:"aantalActieveAntibiotica",op:pick(["<","<=",">",">=","==","!="]),n:Math.floor(rnd()*4)};
   case"med":{const o={p:"medicatieActief",id:pick(["m1","m2"])};const m=rMom();if(m)o.op=m;return o;}
   case"waar":return pick([{p:"waar",veld:"w",op:pick(["<","<=",">",">=","==","!="]),waarde:Math.floor(rnd()*10)},{p:"waar",veld:"s",op:pick(["==","!="]),waarde:pick(["a","b"])}]);
   case"inT":return {p:"inToestand",t:pick(["t1","t2"])};
   case"geb":return {p:"gebeurtenisGeweest",id:pick(["A","B"])};
   case"klachten":{const o={p:"klachten",waarde:pick(["af","aan","geenVerbetering48"])};const r2=rnd();if(r2<0.3)o.op="laatste";else if(r2<0.55)o.op={dag:1+Math.floor(rnd()*5)};else if(r2<0.75)o.op={eindeBeurtNaGebeurtenis:pick(["A","B"]),offset:pick([undefined,0,1])};return o;}
   case"tel":{const t=rnd()<0.7?Object.assign({t:"gespeeld"},rK(),rnd()<0.3?{terwijlKlachten:pick(["af","aan"])}:{}):{t:"aantalActieveAntibiotica",op:"max"};
     if(t.t==="gespeeld"&&rnd()<0.5){const K={};["kaart","kaartUit","start","doel","optie","optieNiet","naGebeurtenis","voorGebeurtenis"].forEach(x=>{if(x in t){K[x]=t[x];delete t[x];}});t.K=K;}
     return {p:"tel",teller:t,op:pick([">",">=","==","<"]),waarde:Math.floor(rnd()*4)};}
   default:return {p:"waarheid",waarde:rnd()<0.5};}}
 const k=pick(["en","of","niet","alsDan"]);
 if(k==="niet")return {p:k,arg:rP(d+1)};if(k==="alsDan")return {p:k,als:rP(d+1),dan:rP(d+1)};
 return {p:k,args:[rP(d+1),rP(d+1),rP(d+1)].slice(0,Math.floor(rnd()*4))};}
let n=0,diff=0,fouten=0,waar=0;
for(let run=0;run<4000;run++){
 const len=Math.floor(rnd()*9);const tl=[];let dag=1;
 for(let i=0;i<len;i++){if(rnd()<0.4)dag++;const k=pick(KS);const l={volg:i+1,kaart:k,dag,doel:null,optie:null};
  if(k==="R1"||k==="R2")l.doel=pick(["Q1","Q2","Q3",null]);if(k==="R3"||k==="R4")l.doel=pick(["m1","m2",null]);if(rnd()<0.1)l.optie="h";tl.push(l);}
 const geb=[];if(rnd()<0.5)geb.push({id:"A",dag:1+Math.floor(rnd()*4)});if(rnd()<0.4)geb.push({id:"B",dag:1+Math.floor(rnd()*4)});
 const kl=[];for(let d=0;d<=dag;d++)if(rnd()<0.8)kl.push({dag:d,status:pick([null,"af","aan","geenVerbetering48"])});
 const sh=rnd()<0.3?tl.slice().reverse():tl;
 const st={tijdlijn:sh,gebeurtenissen:geb,toestanden:rnd()<0.5?["t1"]:[],klachten:kl,dag};
 const ctx=P.maakContext(casus,ep,st);
 for(let j=0;j<40;j++){const p=rP(0);let a,b;try{a=P.evalueer(p,ctx);}catch(e){fouten++;if(fouten<5)console.log("FOUT",e.message,JSON.stringify(p));continue;}
  b=ref(p,Object.assign({},st,{tijdlijn:tl}),ep);n++;if(a)waar++;if(a!==b){diff++;if(diff<6)console.log("VERSCHIL",JSON.stringify(p),a,b,JSON.stringify(tl.map(l=>[l.kaart,l.dag,l.doel])),JSON.stringify(geb));}}}
console.log("synthetisch: vergelijkingen",n,"waar",waar,"verschillen",diff,"fouten",fouten);
