const {laad}=require("./load.js");
const sb=laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E2");
const E=sb.Engine,P=sb.Predicaten;
function rngSeed(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const N=+process.argv[2]||20000, seed=+process.argv[3]||12345;
const R=rngSeed(seed);
const rep=e.repertoire;
const kaarten={};c.kaarten.forEach(k=>kaarten[k.id]=k);
function kandidaten(id){
  const k=kaarten[id];const d=k.doelen&&k.doelen.E2;
  if(!d&&!k.opties) return [[null,null]];
  const out=[];(d||[]).forEach(x=>{ if(k.opties){(k.opties[x.id]||[]).forEach(o=>out.push([x.id,o.tekst]))} else out.push([x.id,null]) });
  return out;
}
const W={G1:1,G2:3,O1:3,O2:3,V1:1,V2:1,V3:1.5,V4:3,V5:3,N1:3,N2:1,Ev1:1,V6:2,B1:3,B2:1.5};
function kies(){ const tot=rep.reduce((a,k)=>a+W[k],0);let r=R()*tot;for(const k of rep){r-=W[k];if(r<=0)return k}return rep[0]}
function genereer(){
  const st=E.nieuwSpel(c,"E2",{rng:()=>0});
  const stappen=1+Math.floor(R()*26);
  const pDag=0.12+R()*0.3;
  for(let i=0;i<stappen;i++){
    if(R()<pDag){ if(!st.dagenVoorbij && st.dag<st.aantalDagen) E.volgendeDag(st); continue; }
    if(st.actiesOver<1){ if(st.dag<st.aantalDagen)E.volgendeDag(st); else break; }
    const id=kies();const ks=kandidaten(id);
    const [doel,optie]=ks[Math.floor(R()*ks.length)];
    E.speelKaart(st,id,{doel,optie});
  }
  if(R()<0.5) { /* soms nog een dag door */ if(st.dag<st.aantalDagen) E.volgendeDag(st); }
  return st;
}
const ABX=["V3","V4","V5"];
function orakel(st){
  const tl=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  const act=new Set();let maxAb=0;const eindDag={};
  const snaps=[]; // na elke kaart
  tl.forEach(r=>{
    if(ABX.includes(r.kaart))act.add(r.kaart);
    else if(r.kaart==="B1"&&r.doel){ABX.forEach(x=>act.delete(x));act.add(r.doel)}
    else if(r.kaart==="B2"&&r.doel)act.delete(r.doel);
    maxAb=Math.max(maxAb,act.size);
    snaps.push({dag:r.dag,act:new Set(act)});
  });
  function actEindeDag(d){ let s=new Set(); for(const x of snaps){ if(x.dag<=d)s=x.act; } return s; }
  const gesp=k=>tl.some(r=>r.kaart===k);
  // C
  const k4=tl[3]; let Cdag=null;
  if(k4 && tl.slice(0,4).some(r=>r.kaart==="O1") && k4.dag<e.knoppen.aantalDagen && st.dag>k4.dag) Cdag=k4.dag+1;
  // klachten
  const stat={};
  for(let d=2;d<=st.dag;d++){ const a=actEindeDag(d-1); stat[d]=a.size===0?null:(a.has("V4")?"af":"aan"); }
  const eGFR=29;
  const viol={};
  viol.I1=!gesp("N1");
  viol.I4=maxAb>1;
  const v3start=tl.some(r=>r.kaart==="V3"||(r.kaart==="B1"&&r.doel==="V3"));
  viol.I5=v3start&&eGFR<30;
  const zonderO1=ABX.some(a=>{const i=tl.findIndex(r=>r.kaart===a);if(i<0)return false;return !tl.slice(0,i).some(r=>r.kaart==="O1")});
  const geenAbx=!ABX.some(gesp);
  viol.I6=gesp("V1")||gesp("V2")||zonderO1||geenAbx;
  const sIdx=tl.findIndex(r=>r.kaart==="V5"||(r.kaart==="B1"&&r.doel==="V5"));
  let o2ok=false,v6ok=false;
  if(sIdx>=0){const s=tl[sIdx].dag;
    o2ok=tl.some(r=>r.kaart==="O2"&&r.dag-s>=1&&r.dag-s<=3);
    v6ok=tl.some(r=>r.kaart==="V6"&&r.doel==="V5"&&r.optie==="halveren"&&r.dag-s>=3);
    viol.I7=!(o2ok&&v6ok);
  } else viol.I7=false;
  let i8=false;
  if(Cdag!==null){ const a=actEindeDag(Cdag+1); const aan=Object.values(stat).some(x=>x==="aan"); i8=a.has("V5")&&aan; }
  viol.I8=i8;
  const ernst={I1:5,I4:5,I5:2,I6:4,I7:3,I8:4}; const volg=["I1","I4","I5","I6","I7","I8"];
  const ids=volg.filter(i=>viol[i]);
  const sorted=ids.slice().sort((a,b)=>ernst[a]-ernst[b]||volg.indexOf(a)-volg.indexOf(b));
  let vraag=null;
  const top=sorted[0];
  const VR={I1:"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",I4:"Wat lost het tweede middel op dat het eerste niet oplost?",I5:"Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",I8:"De kweek is binnen en de klachten blijven. Waar wacht je nog op?"};
  if(top==="I6") vraag=zonderO1?"Wat vertelt een kweek van urine die al antibioticum heeft gezien?":"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?";
  else if(top==="I7") vraag=!o2ok?"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?":"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?";
  else if(top) vraag=VR[top];
  
  const idxV=k=>tl.findIndex(r=>r.kaart===k);
  const g2=idxV("G2");
  const vkaarten=["V1","V2","V3","V4","V5"];
  const zonderG2=vkaarten.some(v=>{const i=idxV(v);return i>=0&&!(g2>=0&&g2<i)});
  const doelm=(g2>=0&&!zonderG2)?3:2;
  const nWissel=tl.filter(r=>r.kaart==="B1"&&(r.dag>=2?stat[r.dag]==="af":false)).length;
  const duur=Math.min(3,Math.max(1,3-nWissel));
  let prof=null;
  if(gesp("V4")&&!gesp("B1"))prof="Kweekgestuurd, smal";
  else if(gesp("V5")&&gesp("B1")&&idxV("B1")>idxV("V5"))prof="Bijgestuurd";
  const fb=[zonderG2,nWissel>0];
  const v3s=v3start, v5s=sIdx>=0;
  const zicht=[v3s&&!gesp("G2"), v5s&&!gesp("O2")];
  return {ids,vraag,Cdag,stat,maxAb,doelm,duur,prof,fb,zicht};
}
function datakant(st){
  const ctx=P.maakContext(c,e,st);
  const geld=i=>i.geldtIn.some(x=>x==="*"||(x&&x.gebeurtenis&&st.gebeurtenissen.some(b=>b.id===x.gebeurtenis)));
  const gesch=e.invarianten.filter(i=>geld(i)&&P.evalueer(i.predicaat,ctx));
  gesch.sort((a,b)=>a.ernst-b.ernst);
  let vraag=null;const t=gesch[0];
  if(t){vraag=t.vraag;(t.vraagVarianten||[]).some(v=>{if(P.evalueer(v.als,ctx)){vraag=v.vraag;return true}return false})}
  
  const dm=e.score.doelmatigheid.regels.find(r=>P.evalueer(r.als,ctx)).punten;
  let du=e.score.duurzaamheid.start;e.score.duurzaamheid.regels.forEach(r=>{du+=r.delta*P.tel(r.perKeer,ctx)});du=Math.min(3,Math.max(1,du));
  const pr=e.profielen.find(p=>P.evalueer(p.als,ctx));
  return {ids:gesch.map(i=>i.id).sort(),vraag,dm,du,prof:pr?pr.naam:null,fb:e.feedbackExtra.map(f=>P.evalueer(f.trigger,ctx)),zicht:e.zichtbaarAlsOntbreekt.map(z=>P.evalueer(z.trigger,ctx))};
}
let fouten=0,tellers={},cmax={};const stat={I1:0,I4:0,I5:0,I6:0,I7:0,I8:0,leeg:0,C:0,Ckl:0};
const voorbeelden=[];
for(let n=0;n<N;n++){
  const st=genereer();
  const o=orakel(st),d=datakant(st);
  // C en klachten (engine/data vs onafhankelijk)
  const cEng=(st.gebeurtenissen.find(b=>b.id==="C")||{}).dag||null;
  let probleem=null;
  if(cEng!==o.Cdag) probleem="C-dag engine "+cEng+" orakel "+o.Cdag;
  for(let dd=2;dd<=st.dag&&!probleem;dd++){ if((st.klachten[dd]||{}).status!==o.stat[dd]) probleem="klachten dag "+dd+": engine "+(st.klachten[dd]||{}).status+" orakel "+o.stat[dd]; }
  const oi=o.ids.slice().sort();
  if(!probleem&&JSON.stringify(oi)!==JSON.stringify(d.ids)) probleem="invarianten orakel "+oi+" data "+d.ids;
  if(!probleem&&o.vraag!==d.vraag) probleem="vraag orakel "+o.vraag+" data "+d.vraag;
  if(!probleem&&(o.doelm!==d.dm))probleem="doelmatigheid orakel "+o.doelm+" data "+d.dm;
  if(!probleem&&(o.duur!==d.du))probleem="duurzaamheid orakel "+o.duur+" data "+d.du;
  if(!probleem&&(o.prof!==d.prof))probleem="profiel orakel "+o.prof+" data "+d.prof;
  if(!probleem&&JSON.stringify(o.fb)!==JSON.stringify(d.fb))probleem="feedbackExtra orakel "+o.fb+" data "+d.fb;
  if(!probleem&&JSON.stringify(o.zicht)!==JSON.stringify(d.zicht))probleem="zichtbaar orakel "+o.zicht+" data "+d.zicht;
  if(probleem){fouten++; if(voorbeelden.length<8)voorbeelden.push({probleem,tl:st.tijdlijn.map(r=>r.kaart+(r.doel?"("+r.doel+(r.optie?","+r.optie:"")+")":"")+"@"+r.dag).join(" "),dag:st.dag})}
  o.ids.forEach(i=>stat[i]++); if(!o.ids.length)stat.leeg++; if(o.Cdag)stat.C++;
}
console.log("routes",N,"afwijkingen",fouten,JSON.stringify(stat));
voorbeelden.forEach(v=>console.log(JSON.stringify(v)));
