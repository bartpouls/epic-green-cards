// per-aanroep kosten in het hoofd-realm (= zoals in een browser), huidig vs. met validatiecache (scratch-kopie)
const fs=require("fs");const root="/home/user/epic-green-cards/";
const SP="/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad/cp4/regels/predicaten.js";
const which=process.argv[2]==="cache"?SP:root+"regels/predicaten.js";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"])(0,eval)(fs.readFileSync(root+f,"utf8"));
(0,eval)(fs.readFileSync(which,"utf8"));
const P=Predicaten,casus=CASUSSEN[0];
function top(o,out,inp){if(Array.isArray(o))o.forEach(x=>top(x,out,inp));else if(o&&typeof o==="object"){let ip=inp;if(typeof o.p==="string"&&!inp){out.push(o);ip=true;}Object.keys(o).forEach(k=>top(o[k],out,ip));}return out;}
const per=[];
casus.episodes.forEach(e=>{const tl=[["G3",1],["O1",1],["V5",1],["O2",2],["V6",3,"V5","halveren"],["G1",3],["N1",4]].map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
 const ctx=P.maakContext(casus,e,{tijdlijn:tl,gebeurtenissen:[{id:"A",dag:3}],klachten:[1,2,3,4].map(d=>({dag:d,status:null})),toestanden:["cystitis"],dag:4});
 top(e,[],false).forEach(p=>per.push([p,ctx]));});
for(let w=0;w<3;w++)per.forEach(([p,c])=>{for(let i=0;i<50;i++)P.evalueer(p,c)}); // warm-up
let N=2000,t0=process.hrtime.bigint();per.forEach(([p,c])=>{for(let i=0;i<N;i++)P.evalueer(p,c)});
const us=Number(process.hrtime.bigint()-t0)/1e3/(N*per.length);
// engine-patroon: 50 predicaten per rondAf
console.log(process.argv[2]||"huidig","predicaten:",per.length,"gem µs/evalueer:",us.toFixed(2),"| 50 predicaten (1 beoordeling):",(us*50/1000).toFixed(2),"ms");
// meest dure 5
const m=per.map(([p,c])=>{const t=process.hrtime.bigint();for(let i=0;i<500;i++)P.evalueer(p,c);return [Number(process.hrtime.bigint()-t)/1e3/500,JSON.stringify(p).slice(0,60)];}).sort((a,b)=>b[0]-a[0]).slice(0,3);
console.log(m.map(x=>x[0].toFixed(1)+"µs "+x[1]).join("\n"));
