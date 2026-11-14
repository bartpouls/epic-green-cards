const L=require("./load.js");const O=require("./orakel.js");const {speel}=require("./speel.js");const {R,BASE}=require("./routes.js");const {vergelijk}=require("./run_routes.js");
const N=+process.argv[2]||3000;let seed=+process.argv[3]||7;function r(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const SP="spironolacton";
const POOL=["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V7","V8","V9","V10","N1","N2:V4","N3","Ev1","Ev2:"+SP,"Ev2:lisinopril","Ev3","V6:V5:halveren","V6:V5:verdubbelen","V6:V8:875/125 mg 2 dd","V6:V8:500/125 mg 2 dd","V6:V7:halveren","V6:lisinopril:halveren","V6:lisinopril:stoppen","B1:V3","B1:V4","B1:V5","B1:V7","B1:V8","B1:V9","B1:V10","B2:V4","B2:V5","B2:V7","B2:V8","B3:"+SP,"B3:calcium","B3:lisinopril","B5:"+SP,"B5:calcium","B4:V7","N1","N1","O1","O1"];
const sb=L.laad();let slecht=0,tel={},tot=0,gehaald=0;
for(let i=0;i<N;i++){ const ord=r()<.5?"AB":"BA"; let plan;
  if(r()<.25){ plan=[];const nd=1+Math.floor(r()*7);for(let d=0;d<nd;d++){const k=Math.floor(r()*4),dg=[];for(let j=0;j<k;j++)dg.push(POOL[Math.floor(r()*POOL.length)]);plan.push(dg);} }
  else { const rr=R.filter(x=>x.plan[ord]); const b=rr[Math.floor(r()*rr.length)]; plan=JSON.parse(JSON.stringify(b.plan[ord])); while(plan.length<7)plan.push([]);
    const m=Math.floor(r()*4); for(let q=0;q<m;q++){ const t=r(),dd=Math.floor(r()*7);
      if(t<.3){ if(plan[dd].length)plan[dd].splice(Math.floor(r()*plan[dd].length),1);} else if(t<.6){ if(plan[dd].length<3)plan[dd].splice(Math.floor(r()*(plan[dd].length+1)),0,POOL[Math.floor(r()*POOL.length)]);} else if(t<.8){ if(plan[dd].length)plan[dd][Math.floor(r()*plan[dd].length)]=POOL[Math.floor(r()*POOL.length)];} else { const d2=Math.min(6,dd+1); if(plan[dd].length&&plan[d2].length<3)plan[d2].push(plan[dd].pop()); } } }
  let s; try{ s=speel(sb,plan,ord,{vrij:true}); }catch(e){ console.log("CRASH",ord,JSON.stringify(plan),e.message);slecht++;continue; }
  const orc=O.orakel(s.tijdlijn,s.volgordeAB,s.dag); const f=vergelijk("fuzz",s.uitkomst,orc,{},s); tot++; if(!orc.ids.length)gehaald++; orc.ids.forEach(x=>tel[x]=(tel[x]||0)+1);
  if(f.length){slecht++; if(slecht<=5) console.log("VERSCHIL",ord,JSON.stringify(plan),"\n   ",f.join("\n    "));} }
console.log("spelen:",tot,"verschillen:",slecht,"poort gehaald:",gehaald);console.log(JSON.stringify(tel));
