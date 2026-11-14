const {wereld}=require("./lib.js");const G=require("./genmut.js");
const ov=require("./overleefd_zp.json").filter(x=>!x.startsWith("todo["));
// corpus
const SP="spironolacton";
const bases={AB:[[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8","V6:V8:875/125 mg 2 dd"],["Ev1","B3:"+SP,"V6:lisinopril:halveren"],["N3"]],
 [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B4:V7"],["B1:V8","V6:V8:875/125 mg 2 dd","Ev1"],["B3:"+SP,"V6:lisinopril:halveren","N3"]],
 [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B3:calcium"],["Ev1","B3:"+SP,"V6:lisinopril:halveren"],["N3","B5:"+SP]]],
 BA:[[["G3","O1","V4"],["N1"],["B3:"+SP,"V6:lisinopril:halveren"],["N3","Ev1","O2"],["O1","B1:V8","V6:V8:875/125 mg 2 dd"],["Ev1","Ev2:"+SP]],
 [["G3","O1","V4"],["N1"],["B3:"+SP,"V6:lisinopril:halveren"],["N3","Ev1","O2"],["O1","B1:V7","B4:V7"],["B1:V8","V6:V8:875/125 mg 2 dd","Ev1"],["Ev2:"+SP]]]};
const POOL=["G1","G3","O1","O2","V1","V2","V3","V4","V5","V7","V8","V9","V10","N1","N3","Ev1","Ev3","V6:V5:halveren","V6:V8:875/125 mg 2 dd","V6:V8:500/125 mg 2 dd","V6:lisinopril:halveren","B1:V3","B1:V4","B1:V5","B1:V7","B1:V8","B1:V9","B1:V10","B2:V4","B2:V5","B2:V7","B2:V8","B3:"+SP,"B3:calcium","B5:"+SP,"B4:V7","Ev2:"+SP];
let seed=11;function r(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const corpus=[];
for(let i=0;i<500;i++){const order=r()<.5?"AB":"BA";let plan;
  if(r()<.15){plan=[];const nd=1+Math.floor(r()*7);for(let d=0;d<nd;d++){const k=Math.floor(r()*4);const day=[];for(let j=0;j<k;j++)day.push(POOL[Math.floor(r()*POOL.length)]);plan.push(day);}}
  else{const b=bases[order][Math.floor(r()*bases[order].length)];plan=JSON.parse(JSON.stringify(b));while(plan.length<7)plan.push([]);const m=1+Math.floor(r()*3);
  for(let k=0;k<m;k++){const t=r(),d=Math.floor(r()*7);
    if(t<.3){if(plan[d].length)plan[d].splice(Math.floor(r()*plan[d].length),1);} else if(t<.6){if(plan[d].length<3)plan[d].splice(Math.floor(r()*(plan[d].length+1)),0,POOL[Math.floor(r()*POOL.length)]);}
    else if(t<.8){if(plan[d].length)plan[d][Math.floor(r()*plan[d].length)]=POOL[Math.floor(r()*POOL.length)];} else {const d2=Math.min(6,d+1);if(plan[d].length&&plan[d2].length<3){plan[d2].push(plan[d].pop());}}}}
  corpus.push({order,plan,modus:r()<.8?"vol":"direct"});}
function sig(mutfn){
  const W=wereld({}); const c=W.c;
  // mutatie toepassen op het geladen e3 object
  if(mutfn) mutfn(W.e3,c);
  const uit=[];
  for(const x of corpus){ let s; try{ s=W.speel(x.plan,x.order,x.modus);}catch(e){uit.push("ERR");continue;}
    let a; try{a=[W.dataSchendingen(s).join(","),W.score(s,"duurzaamheid"),W.score(s,"doelmatigheid"),W.profiel(s),W.extra(s).join("|"),W.zicht(s).join(","),W.dataSchendingen(s).map(id=>W.vraagVan(s,id)).join("|"),s.klachten.map(k=>k&&k.status).join(",")].join(";"); }catch(e){a="ERR:"+e.message.slice(0,50);}
    uit.push(a);}
  return uit;
}
const base=sig(null);
const P=+process.argv[2],NP=+process.argv[3];const muts=G.muts.filter(m=>ov.includes(m.id)).filter((m,i)=>i%NP===P);
const echt=[],eq=[];
for(const m of muts){ const sg=sig((e3,c)=>G.apply(m,e3,c)); let diff=0;for(let i=0;i<sg.length;i++) if(sg[i]!==base[i]) diff++; (diff?echt:eq).push({id:m.id,diff}); }
console.log("overlevers zonder pin (niet-TODO):",muts.length,"gedragsverschil op corpus:",echt.length,"equivalent op corpus:",eq.length);
require("fs").writeFileSync("gedrag_echt_"+P+".json",JSON.stringify(echt));require("fs").writeFileSync("gedrag_eq_"+P+".json",JSON.stringify(eq));
