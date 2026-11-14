const L=require("./load.js");const sb=L.laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E3");
const op=new Set();(function w(x,p){ if(Array.isArray(x))x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>{ if(/^TODO_BART/.test(k)&&typeof x[k]==="string") op.add(x[k]); else w(x[k],p+"."+k);});})(e,"E3");
const t=c.todoBart.filter(x=>/^TODO_BART-E3-/.test(x.id));
t.forEach(x=>{ if(!op.has(x.vraag)) console.log("TODO zonder markering op de plek:",x.id,"-> plek:",x.plek); });
console.log("markeringen op de plek (uniek):",op.size,"todoBart E3:",t.length);
const keys=["id","vraag","gekozenLezing","plek"];t.forEach(x=>{ if(Object.keys(x).sort().join()!==keys.slice().sort().join()) console.log("vorm",x.id,Object.keys(x)); keys.forEach(k=>{ if(typeof x[k]!=="string"||!x[k].trim()) console.log("leeg",x.id,k);});});
// verwijzingen naar onbekende "Alternatief" bij 2 lezingen
t.forEach(x=>{ if(!/Alternatief|alternatief|Vraag aan Bart/.test(x.gekozenLezing)) console.log("geen alternatief genoemd:",x.id); });
