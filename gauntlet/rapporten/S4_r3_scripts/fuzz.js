const {wereld}=require("./lib.js");const {judge}=require("./judge.js");
const W=wereld();
const SP=["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V7","V8","V9","V10","N1","N2:V4","N3","Ev1","Ev3",
 "V6:V5:halveren","V6:V5:verdubbelen","V6:V8:875/125 mg 2 dd","V6:V8:500/125 mg 2 dd","V6:V7:geen aanpassing","V6:lisinopril:halveren","V6:lisinopril:stoppen",
 "B1:V3","B1:V4","B1:V5","B1:V7","B1:V8","B1:V9","B1:V10","B2:V4","B2:V7","B2:V8","B2:V5","B2:V3",
 "B3:spironolacton","B3:lisinopril","B3:calcium","B5:spironolacton","B5:calcium","B5:lisinopril","B4:V7","Ev2:spironolacton","Ev2:lisinopril"];
const BASIS=["G3","O1","N1","O2","Ev2:spironolacton","V4","V7","V8","V6:V8:875/125 mg 2 dd","B4:V7","B3:calcium","Ev1","N3","B3:spironolacton","V6:lisinopril:halveren","B1:V8","B1:V7"];
let seed=+process.argv[3]||1;function r(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const N=+process.argv[2]||20000;
const mism={};let n=0,gespeeld=0,gesch={};
for(let i=0;i<N;i++){
  const order=r()<.5?"AB":"BA"; const plan=[];const nd=1+Math.floor(r()*7);
  for(let d=0;d<nd;d++){const k=Math.floor(r()*4);const day=[];for(let j=0;j<k;j++){day.push(r()<.6?BASIS[Math.floor(r()*BASIS.length)]:SP[Math.floor(r()*SP.length)]);}plan.push(day);}
  const s=W.speel(plan,order,r()<.7?"vol":"direct");
  const a=W.dataSchendingen(s),b=judge(s);
  gespeeld+=s.tijdlijn.length;n++;
  a.forEach(x=>gesch[x]=(gesch[x]||0)+1);
  if(a.join()!==b.join()){const key=a.filter(x=>!b.includes(x)).map(x=>"data+"+x).concat(b.filter(x=>!a.includes(x)).map(x=>"judge+"+x)).join(",");
    (mism[key]=mism[key]||[]).push({order,plan:JSON.stringify(plan),a:a.join(),b:b.join()});}
}
console.log("plays",n,"cards",gespeeld);console.log("data-schendingen per invariant:",JSON.stringify(gesch));
Object.keys(mism).forEach(k=>{console.log("MISMATCH",k,mism[k].length);console.log("   ",mism[k][0].order,mism[k][0].plan,"data=",mism[k][0].a,"judge=",mism[k][0].b);});
if(!Object.keys(mism).length) console.log("geen verschillen");
