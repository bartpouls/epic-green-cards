const sb=require("./load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];
let nt=0,bad=0;
function walk(o,pth,ep){ if(Array.isArray(o)){o.forEach((x,i)=>walk(x,pth+"["+i+"]",ep));return;} if(o&&typeof o==="object"){ if(o.perKeer){nt++;try{P.valideer(o.perKeer,casus,ep);}catch(e){bad++;console.log("FOUT",pth,e.message)}} if(typeof o.t==="string"&&!o.p){nt++;console.log("teller",pth,JSON.stringify(o).slice(0,100));} Object.keys(o).forEach(k=>walk(o[k],pth+"."+k,ep)); } }
casus.episodes.forEach(ep=>walk(ep,ep.id,ep));console.log(nt,bad);
// alle sleutels in score
casus.episodes.forEach(ep=>console.log(ep.id,JSON.stringify(ep.score).slice(0,600)));
// welke velden op predicaten worden gebruikt
const gebruikt={};
function w2(o){ if(Array.isArray(o)){o.forEach(w2);return;} if(o&&typeof o==="object"){ if(typeof o.p==="string"){const k=o.p;gebruikt[k]=gebruikt[k]||new Set();Object.keys(o).forEach(x=>gebruikt[k].add(x));} Object.values(o).forEach(w2);} }
w2(casus);for(const k in gebruikt)console.log(k,[...gebruikt[k]].join(","));
