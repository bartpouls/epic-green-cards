const sb=require("../S5_r3_scripts/load.js");const P=sb.Predicaten,casus=sb.CASUSSEN[0];
const alle=[];(function w(o,epi){if(Array.isArray(o))o.forEach(x=>w(x,epi));else if(o&&typeof o==="object"){if(typeof o.p==="string")alle.push({o,epi});Object.keys(o).forEach(k=>w(o[k],(!epi&&/^E[123]$/.test(k))?k:epi));}})(casus.kaarten,null);casus.episodes.forEach(e=>(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object"){if(typeof o.p==="string")alle.push({o,epi:e.id});Object.keys(o).forEach(k=>w(o[k]));}})(e));
const e=casus.episodes[2];const tl=e.repertoire.map((k,i)=>({volg:i+1,kaart:k,dag:1+Math.floor(i/3),doel:null,optie:null}));
const ctx=P.maakContext(casus,e,{tijdlijn:tl,gebeurtenissen:[{id:"A",dag:3}],klachten:[1,2,3].map(d=>({dag:d,status:"aan"})),toestanden:["cystitis"],dag:7});
let n=0,t=Date.now();for(let i=0;i<200;i++)alle.filter(x=>!x.epi||x.epi==="E3").forEach(x=>{P.evalueer(x.o,ctx);n++});
const ms=Date.now()-t;console.log(n,"evaluaties",ms,"ms",(ms*1000/n).toFixed(1),"us/eval, tijdlijn",tl.length);
