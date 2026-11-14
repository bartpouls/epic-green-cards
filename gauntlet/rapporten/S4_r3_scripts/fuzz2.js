const {wereld}=require("./lib.js");const {judge}=require("./judge.js");
const W=wereld();
const SP="spironolacton";
const bases={
AB:[[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8","V6:V8:875/125 mg 2 dd"],["Ev1","B3:"+SP,"V6:lisinopril:halveren"],["N3"]],
    [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B4:V7"],["B1:V8","V6:V8:875/125 mg 2 dd","Ev1"],["B3:"+SP,"V6:lisinopril:halveren","N3"]],
    [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B3:calcium"],["Ev1","B3:"+SP,"V6:lisinopril:halveren"],["N3","B5:"+SP]]],
BA:[[["G3","O1","V4"],["N1"],["B3:"+SP,"V6:lisinopril:halveren"],["N3","Ev1","O2"],["O1","B1:V8","V6:V8:875/125 mg 2 dd"],["Ev1","Ev2:"+SP]],
    [["G3","O1","V4"],["N1"],["B3:"+SP,"V6:lisinopril:halveren"],["N3","Ev1","O2"],["O1","B1:V7","B4:V7"],["B1:V8","V6:V8:875/125 mg 2 dd","Ev1"],["Ev2:"+SP]]]};
const POOL=["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V7","V8","V9","V10","N1","N3","Ev1","Ev3","V6:V5:halveren","V6:V8:875/125 mg 2 dd","V6:V8:500/125 mg 2 dd","V6:lisinopril:halveren","V6:V7:geen aanpassing","B1:V3","B1:V4","B1:V5","B1:V7","B1:V8","B1:V9","B1:V10","B2:V4","B2:V5","B2:V7","B2:V8","B3:"+SP,"B3:lisinopril","B3:calcium","B5:"+SP,"B5:calcium","B4:V7","Ev2:"+SP,"Ev2:lisinopril"];
let seed=+process.argv[3]||7;function r(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const N=+process.argv[2]||50000;let mism={},n=0,eq1={},cnt={};
for(let i=0;i<N;i++){
  const order=r()<.5?"AB":"BA";const b=bases[order][Math.floor(r()*bases[order].length)];
  let plan=JSON.parse(JSON.stringify(b));while(plan.length<7)plan.push([]);
  const m=1+Math.floor(r()*3);
  for(let k=0;k<m;k++){const t=r();const d=Math.floor(r()*7);
    if(t<.25){ if(plan[d].length) plan[d].splice(Math.floor(r()*plan[d].length),1);}
    else if(t<.5){ if(plan[d].length<3) plan[d].splice(Math.floor(r()*(plan[d].length+1)),0,POOL[Math.floor(r()*POOL.length)]);}
    else if(t<.7){ if(plan[d].length) plan[d][Math.floor(r()*plan[d].length)]=POOL[Math.floor(r()*POOL.length)];}
    else if(t<.85){ const d2=Math.floor(r()*7); if(plan[d].length&&plan[d2].length<3){const c=plan[d].splice(Math.floor(r()*plan[d].length),1)[0];plan[d2].splice(Math.floor(r()*(plan[d2].length+1)),0,c);} }
    else { // verschuif dag
      const d2=Math.min(6,d+1); if(plan[d].length&&plan[d2].length<3&&d2!==d){plan[d2].push(plan[d].pop());} }
  }
  const s=W.speel(plan,order,"vol");n++;
  const a=W.dataSchendingen(s),jd=judge(s);
  if(!s._fouten.length){ const key=a.join(); cnt[key]=(cnt[key]||0)+1; }
  if(a.join()!==jd.join()){const key=a.filter(x=>!jd.includes(x)).map(x=>"data+"+x).concat(jd.filter(x=>!a.includes(x)).map(x=>"judge+"+x)).join(",");(mism[key]=mism[key]||[]).push({order,plan:JSON.stringify(plan),a:a.join(),b:jd.join()});}
}
console.log("plays",n);console.log("exact-1 sets:",Object.keys(cnt).filter(k=>!k.includes(",")&&k).map(k=>k+":"+cnt[k]).join(" "), " leeg:",cnt[""]);
Object.keys(mism).forEach(k=>{console.log("MISMATCH",k,mism[k].length);console.log("   ",mism[k][0].order,mism[k][0].plan,"data=",mism[k][0].a,"judge=",mism[k][0].b);});
if(!Object.keys(mism).length) console.log("geen verschillen");
