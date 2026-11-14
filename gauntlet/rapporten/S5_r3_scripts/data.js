const sb=require("./load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];
let n=0,bad=0;const by={};
function walk(o,pth,ep){ if(Array.isArray(o)){o.forEach((x,i)=>walk(x,pth+"["+i+"]",ep));return;} if(o&&typeof o==="object"){ if(typeof o.p==="string"){ n++; const k=pth.replace(/\[\d+\]/g,"[]").split(".").slice(0,2).join("."); by[k]=(by[k]||0)+1; try{P.valideer(o,casus,ep);}catch(e){bad++;console.log("FOUT",pth,e.message);} } Object.keys(o).forEach(k=>walk(o[k],pth+"."+k,ep)); } }
casus.episodes.forEach(ep=>walk(ep,ep.id,ep));
casus.kaarten.forEach((k,i)=>{ if(k.doelen) Object.keys(k.doelen).forEach(E=>{const ep=casus.episodes.find(e=>e.id===E); walk(k.doelen[E],"kaart "+k.id+".doelen."+E,ep);}); });
console.log("predicaten (incl. geneste) gevalideerd:",n,"fouten:",bad);console.log(by);
// ook de ctx-vorm (valideer(pred,ctx)) en via evalueer op lege staat en willekeurige staat
