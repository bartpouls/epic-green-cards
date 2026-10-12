// Corpus van speelplannen voor differentiële gedragstest (orig vs mutant).
const L=require("./load.js"); if(!globalThis.Engine) L.laad();
const {R}=require("./routes.js"); const {F}=require("./fout.js");
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const casus=CASUSSEN[0], ep=L.ep3();
function tokens(){ const t=[]; for(const id of ep.repertoire){ const k=casus.kaarten.filter(x=>x.id===id)[0]; const d=k.doelen&&k.doelen.E3;
  if(d){ for(const x of d){ if(k.opties&&k.opties[x.id]) for(const o of k.opties[x.id]) t.push(id+">"+x.id+">"+(o.tekst||o)); else t.push(id+">"+x.id);} } else t.push(id);} return t; }
const ALLE=tokens();
const INTERESSANT=["G3","O1","O1","V4","V5","V7","V8","V9","V3","N1","N3","O2","Ev1","Ev1","Ev2>spironolacton","Ev2>lisinopril","Ev3","B1>V8","B1>V7","B1>V9","B1>V4","B1>V5","B1>V10","B2>V4","B2>V5","B2>V7","B2>V8","B3>spironolacton","B3>calcium","B3>lisinopril","B4>V7","B5>spironolacton","B5>lisinopril","B5>calcium","V6>V5>halveren","V6>V5>verdubbelen","V6>V8>875/125 mg 2 dd","V6>V8>500/125 mg 2 dd","V6>lisinopril>halveren","V6>lisinopril>stoppen","V6>V7>halveren","V6>V7>geen aanpassing","V1","V2","V10","G1","G2","N2>V4","|","|","|"];
function perturb(plan, rnd){
  const p=plan.slice(); const n=1+Math.floor(rnd()*3);
  for(let e=0;e<n;e++){ const r=rnd(), i=Math.floor(rnd()*Math.max(1,p.length));
    if(r<0.25) p.splice(i,1);
    else if(r<0.5) p.splice(i,0,INTERESSANT[Math.floor(rnd()*INTERESSANT.length)]);
    else if(r<0.65){ const j=Math.floor(rnd()*p.length); const t=p[i]; p[i]=p[j]; p[j]=t; }
    else if(r<0.8) p[i]=INTERESSANT[Math.floor(rnd()*INTERESSANT.length)];
    else if(r<0.9){ // verplaats een dagwissel
      const idx=p.map((t,k)=>t==="|"?k:-1).filter(k=>k>=0); if(idx.length){ const k=idx[Math.floor(rnd()*idx.length)]; p.splice(k,1); p.splice(Math.max(0,Math.min(p.length,k+(rnd()<0.5?-1:1))),0,"|"); } }
    else { p.push("|"); }
  }
  return p;
}
function randomPlan(rnd){ const p=[]; const len=6+Math.floor(rnd()*14);
  for(let i=0;i<len;i++){ p.push(rnd()<0.8?INTERESSANT[Math.floor(rnd()*INTERESSANT.length)]:ALLE[Math.floor(rnd()*ALLE.length)]); if(rnd()<0.25) p.push("|"); }
  while(rnd()<0.5) p.push("|"); return p; }
// pogingen die geweigerd worden, worden overgeslagen (niet strikt)
function bouw(seed, perturbN, randomN){
  const rnd=mulberry(seed); const basis=[...R,...F].filter(r=>r.steps).map(r=>({order:r.order,steps:r.steps}));
  const c=basis.slice();
  for(const b of basis) for(let i=0;i<perturbN;i++) c.push({order:b.order,steps:perturb(b.steps,rnd)});
  for(let i=0;i<randomN;i++) c.push({order:rnd()<0.5?"AB":"BA",steps:randomPlan(rnd)});
  return c;
}
function signatuur(ep, plan){
  L.zetEp3(ep);
  const {play}=require("./speel.js");
  try{ const r=play(plan.order,plan.steps,{strict:false}); const st=r.st;
    return JSON.stringify([r.u, st.klachten, st.gebeurtenissen, st.toestanden, st.sets, st.tijdlijn.length, r.log.length, st.onthuld, st.zichtbaar, st.volgordeAB]); }
  catch(e){ return "ERR "+e.message; }
}
module.exports={bouw,signatuur,ALLE,INTERESSANT};
// Gestructureerd corpus: alle paren tokens (zonder en met prefix)
module.exports.paren=function(){
  const C=[]; const E2s="Ev2>spironolacton";
  const T=ALLE.filter(t=>!/^N2>/.test(t)||true);
  const P0=["G3","O1","V4","|","N1","O2",E2s,"|"];
  const P1=["O1","V4","|","N1","|"];
  for(const a of T) { C.push({order:"AB",steps:[a,"G3"]}); C.push({order:"AB",steps:["G3",a]}); C.push({order:"AB",steps:[a]});
    for(const b of T){ C.push({order:"AB",steps:[a,b]}); C.push({order:"AB",steps:P0.concat([a,b])}); C.push({order:"BA",steps:P0.concat([a,b])}); C.push({order:"AB",steps:P1.concat([a,"|",b])}); C.push({order:"AB",steps:P0.concat([a,"|",b])}); } }
  return C; };
// Corpus van plannen die de poort HALEN (perturbaties van geldige routes), voor score/profiel/extra/zichtbaar
module.exports.passend=function(seed,N){
  const {play}=require("./speel.js"); const rnd=mulberry(seed); const basis=R.map(r=>({order:r.order,steps:r.steps})); const uit=[];
  let g=0; while(uit.length<N && g<N*30){ g++; const b=basis[Math.floor(rnd()*basis.length)]; const p={order:b.order,steps:perturb(b.steps,rnd)};
    try{ const r=play(p.order,p.steps,{strict:false}); if(r.u.poortGehaald) uit.push(p); }catch(e){} }
  return uit; };
