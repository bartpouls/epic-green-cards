const fs=require("fs"),vm=require("vm");
const root="/home/user/epic-green-cards";
const G=require("./genmut.js");const O=require("../orakel.js");const {speel}=require("../speel.js");const {R}=require("../routes.js");
const {vergelijk}=require("../run_routes.js");
const cache={};const src=f=>cache[f]||(cache[f]=fs.readFileSync(f.startsWith("/")?f:root+"/"+f,"utf8"));
const TESTFILE=__dirname+"/data-e3.zonderpin.crit.js";
function bouw(mut){ const sb={console:{log(){},error(){}},setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"].forEach(f=>vm.runInContext(src(f),sb,{filename:f}));
  if(mut){ const e3=sb.CASUSSEN[0].episodes.find(e=>e.id==="E3"); G.apply(mut,e3); }
  ["regels/predicaten.js","regels/evaluatie.js","engine/engine.js","tests/testlib.js"].forEach(f=>vm.runInContext(src(f),sb,{filename:f}));
  return sb; }
function builderTests(sb){ vm.runInContext(src(TESTFILE),sb,{filename:"t"}); const res=sb.Test.draaiAlles("data-e3"); return res.filter(r=>!r.ok).map(r=>r.naam); }
// eigen controle: alle routes + n fuzzspelen tegen het orakel; true = verschil gevonden
function eigen(sb,n){ let seed=5; const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  try{ sb.Evaluatie.valideerCasus(sb.CASUSSEN[0]); }catch(e){ return "ongeldig: "+e.message.slice(0,60); }
  for(const rt of R){ for(const ord of ["AB","BA"]){ if((rt.claim.onlyAB&&ord==="BA")||(rt.claim.onlyBA&&ord==="AB")||(rt.claim.skipBA&&ord==="BA")) continue;
    try{ const s=speel(sb,rt.plan[ord],ord,{vroeg:rt.claim.vroeg}); const orc=O.orakel(s.tijdlijn,s.volgordeAB,s.dag); const f=vergelijk(rt.id,s.uitkomst,orc,rt.claim,s); if(f.length) return "route "+rt.id+" ["+ord+"]: "+f[0].slice(0,80);}catch(e){ return "route-fout "+rt.id+": "+e.message.slice(0,80);} } }
  const POOL=["G1","G3","O1","O2","V1","V2","V3","V4","V5","V7","V8","V9","V10","N1","N3","Ev1","Ev2:spironolacton","Ev3","V6:V5:halveren","V6:V8:875/125 mg 2 dd","V6:V8:500/125 mg 2 dd","V6:lisinopril:halveren","B1:V3","B1:V4","B1:V5","B1:V7","B1:V8","B1:V9","B1:V10","B2:V4","B2:V5","B2:V7","B3:spironolacton","B3:calcium","B5:spironolacton","B4:V7","N1","O1"];
  for(let i=0;i<n;i++){ const ord=r()<.5?"AB":"BA"; let plan;
    if(r()<.2){ plan=[];const nd=1+Math.floor(r()*7);for(let d=0;d<nd;d++){const k=Math.floor(r()*4),dg=[];for(let j=0;j<k;j++)dg.push(POOL[Math.floor(r()*POOL.length)]);plan.push(dg);} }
    else{ const rr=R.filter(x=>x.plan[ord]); const b=rr[Math.floor(r()*rr.length)]; plan=JSON.parse(JSON.stringify(b.plan[ord])); while(plan.length<7)plan.push([]); const m=Math.floor(r()*4);
      for(let q=0;q<m;q++){ const t=r(),dd=Math.floor(r()*7); if(t<.3){ if(plan[dd].length)plan[dd].splice(Math.floor(r()*plan[dd].length),1);} else if(t<.6){ if(plan[dd].length<3)plan[dd].splice(Math.floor(r()*(plan[dd].length+1)),0,POOL[Math.floor(r()*POOL.length)]);} else if(t<.8){ if(plan[dd].length)plan[dd][Math.floor(r()*plan[dd].length)]=POOL[Math.floor(r()*POOL.length)];} else { const d2=Math.min(6,dd+1); if(plan[dd].length&&plan[d2].length<3)plan[d2].push(plan[dd].pop()); } } }
    try{ const s=speel(sb,plan,ord,{vrij:true}); const orc=O.orakel(s.tijdlijn,s.volgordeAB,s.dag); const f=vergelijk("f",s.uitkomst,orc,{},s); if(f.length) return "fuzz: "+f[0].slice(0,80);}catch(e){ return "fuzz-fout: "+e.message.slice(0,80);} }
  return null; }
exports.bouw=bouw;exports.builderTests=builderTests;exports.eigen=eigen;
if(require.main===module){
  const part=+process.argv[2],parts=+process.argv[3],out=process.argv[4],n=+process.argv[5]||300; const lim=+process.argv[6]||1e9;
  fs.writeFileSync(out,"");
  let sd=99;const rr=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;};
  const perm=G.muts.map((m,i)=>i);for(let i=perm.length-1;i>0;i--){const j=Math.floor(rr()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
  perm.forEach((mi,k)=>{ const m=G.muts[mi]; if(k%parts!==part||k>=lim) return; const t0=Date.now();
    let rec={id:m.id}; try{ const sb=bouw(m); let fails; try{ fails=builderTests(sb);}catch(e){ fails=["TESTCRASH "+e.message.slice(0,60)]; }
      rec.builderFails=fails.length; rec.builderFirst=fails[0]||null;
      rec.eigen=eigen(sb,n);
    }catch(e){ rec.laad=e.message.slice(0,100); }
    rec.ms=Date.now()-t0; fs.appendFileSync(out,JSON.stringify(rec)+"\n"); });
  fs.appendFileSync(out,"KLAAR\n"); }
