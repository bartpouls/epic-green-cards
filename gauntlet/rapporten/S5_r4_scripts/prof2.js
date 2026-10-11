const sb=require("../S5_r3_scripts/load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];
function all(o,out){if(Array.isArray(o))o.forEach(x=>all(x,out));else if(o&&typeof o==="object"){if(typeof o.p==="string")out.push(o);Object.keys(o).forEach(k=>all(o[k],out));}return out;}
let tot=0,cnt=0,top=[];
const toppreds=[];
casus.episodes.forEach(e=>{
 const tl=[["G3",1],["O1",1],["V5",1],["O2",2],["V6",3,"V5","halveren"],["G1",3],["N1",4]].map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
 const ctx=P.maakContext(casus,e,{tijdlijn:tl,gebeurtenissen:[{id:"A",dag:3}],klachten:[1,2,3,4].map(d=>({dag:d,status:null})),toestanden:["cystitis"],dag:4});
 const A=all(e,[]);// bevat geneste ook
 const top=A.filter(p=>true);
 top.forEach(p=>{
  let t0=process.hrtime.bigint(),ok=true;
  const N=200;
  try{for(let i=0;i<N;i++)P.evalueer(p,ctx);}catch(er){ok=false;}
  const us=Number(process.hrtime.bigint()-t0)/1e3/N;
  toppreds.push({ep:e.id,us,ok,p:JSON.stringify(p).length,s:JSON.stringify(p).slice(0,90)});
  cnt++;tot+=us;
 });
});
console.log("predicaten (incl. geneste):",cnt,"gem µs",(tot/cnt).toFixed(1),"fouten:",toppreds.filter(x=>!x.ok).length);
toppreds.sort((a,b)=>b.us-a.us);console.log(toppreds.slice(0,8).map(x=>x.us.toFixed(0)+"µs "+x.ep+" "+x.s).join("\n"));
// zonder validatie? benader: tijd van valideer alleen
let tv=0,c2=0;casus.episodes.forEach(e=>{const ctx=P.maakContext(casus,e,{});all(e,[]).forEach(p=>{const t0=process.hrtime.bigint();for(let i=0;i<200;i++)P.valideer(p,ctx);tv+=Number(process.hrtime.bigint()-t0)/1e3/200;c2++;});});
console.log("valideer alleen gem µs",(tv/c2).toFixed(1));
