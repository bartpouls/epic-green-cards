const fs=require("fs");
const alle=[0,1,2,3].flatMap(i=>JSON.parse(fs.readFileSync("mut_uit_"+i+".json","utf8")));
const cat=m=> m.laadfout?"laadfout": (m.rood>0 ? (m.roodZonderPin>0?"gedood-onafhankelijk":"gedood-alleen-pin") : "OVERLEEFD");
const tel={}; alle.forEach(m=>{ const k=cat(m); tel[k]=(tel[k]||0)+1; });
console.log("totaal",alle.length,tel);
const beh=m=>/^VERSCHIL/.test(m.beh)?"gedrag-verandert":(m.beh==="gelijk"?"gedrag-gelijk":m.beh.slice(0,12));
const kruis={}; alle.forEach(m=>{ const k=cat(m)+" / "+beh(m); kruis[k]=(kruis[k]||0)+1; }); console.log(kruis);
const perSoort={}; alle.forEach(m=>{ const k=m.soort+": "+cat(m); perSoort[k]=(perSoort[k]||0)+1; }); 
// lijst: onafhankelijk gemist (gedrag verandert) = relevantste
const lees=(m)=>m.id+" "+m.doel+":"+m.pad+" ["+m.soort+"] beh="+m.beh+" rood="+m.rood+" zonderPin="+m.roodZonderPin;
const A=alle.filter(m=>cat(m)==="OVERLEEFD"&&/^VERSCHIL/.test(m.beh)); console.log("\nOVERLEEFD + gedrag verandert:",A.length); A.forEach(m=>console.log(" ",lees(m)));
const B=alle.filter(m=>cat(m)==="gedood-alleen-pin"&&/^VERSCHIL/.test(m.beh)); console.log("\nalleen door pin gedood, gedrag verandert:",B.length); B.slice(0,80).forEach(m=>console.log(" ",lees(m)));
const C=alle.filter(m=>cat(m)==="OVERLEEFD"&&!/^VERSCHIL/.test(m.beh)); console.log("\nOVERLEEFD, gedrag gelijk:",C.length); C.slice(0,60).forEach(m=>console.log(" ",lees(m)));
fs.writeFileSync("mut_samenvatting.json",JSON.stringify({tel,kruis,A:A.map(lees),B:B.map(lees),C:C.map(lees)},null,1));
