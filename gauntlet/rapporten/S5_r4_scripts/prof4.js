// Vergelijk per-call kosten: huidig vs. met WeakMap-cache (scratch-kopie), op echte predicaten, ook splits validatie/evaluatie
const fs=require("fs"),vm=require("vm");
const SP="/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad";
function load(pred){const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
 for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"])vm.runInContext(fs.readFileSync("/home/user/epic-green-cards/"+f,"utf8"),sb);
 vm.runInContext(fs.readFileSync(pred,"utf8"),sb);return sb;}
function top(o,out,inpred){ if(Array.isArray(o))o.forEach(x=>top(x,out,inpred));else if(o&&typeof o==="object"){ if(typeof o.p==="string"&&!inpred){out.push(o);inpred=true;} Object.keys(o).forEach(k=>top(o[k],out,inpred)); } return out;}
for(const [naam,pf] of [["huidig","/home/user/epic-green-cards/regels/predicaten.js"],["cache",SP+"/cp4/regels/predicaten.js"],["r2(zonder eager)",SP+"/pred_x.js"]]){
 if(!fs.existsSync(pf))continue;
 const sb=load(pf),P=sb.Predicaten,casus=sb.CASUSSEN[0];
 let tot=0,cnt=0;
 casus.episodes.forEach(e=>{const tl=[["G3",1],["O1",1],["V5",1],["O2",2],["V6",3,"V5","halveren"],["G1",3],["N1",4]].map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
  const ctx=P.maakContext(casus,e,{tijdlijn:tl,gebeurtenissen:[],klachten:[],toestanden:["cystitis"],dag:4});
  top(e,[],false).forEach(p=>{const N=300;const t0=process.hrtime.bigint();for(let i=0;i<N;i++)P.evalueer(p,ctx);tot+=Number(process.hrtime.bigint()-t0)/1e3/N;cnt++;});});
 console.log(naam,"toppredicaten:",cnt,"gem µs/evalueer:",(tot/cnt).toFixed(1));
}
