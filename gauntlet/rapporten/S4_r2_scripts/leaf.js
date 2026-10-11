const fs=require("fs");const {laad,root}=require("./lad.js");
const src=(fs.readFileSync(root+"/casus-uwi.md","utf8")+"\n"+fs.readFileSync(root+"/bouwopdracht-uwi.md","utf8")).replace(/\*\*/g,"").replace(/\*/g,"");
const e=laad().CASUSSEN[0].episodes.find(x=>x.id==="E3");
const uit=[];(function w(x,p){ if(typeof x==="string")uit.push([p,x]); else if(Array.isArray(x))x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>w(x[k],p+"."+k));})(e,"E3");
const skip=/\.(p|id|kaart|doel|optie|middel|veld|op|t|naGebeurtenis|eindeBeurtNaGebeurtenis|type|groep|toestand|waarde|kaartUit|uitSet|start|sleutel|kaart|wanneer|naam)$|TODO_BART|\.(waar|antibiotica|repertoire|startToestanden|medicatie)\b|\.args\[|\.id$|\.label$|\.(resistent|gevoelig)\[|\.als\.|\.trigger|\.K\./;
let n=0;uit.forEach(([p,s])=>{ if(skip.test(p)) return; n++; if(!src.includes(s)) console.log("NIET IN BRON:",p,JSON.stringify(s)); });
console.log("gecontroleerd",n);
