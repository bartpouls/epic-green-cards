const fs=require("fs");const {root,laad}=require("./load.js");
const md=fs.readFileSync(root+"casus-uwi.md","utf8");
const lines=md.split("\n");
const s5=lines.slice(165,232).join("\n").replace(/\*\*/g,"");  // sectie 5
const s3=lines.slice(69,105).join("\n").replace(/\*\*/g,"");
const sb=laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E2");
// 1. alle data-strings van E2 (zonder TODO_BART sleutels) moeten in casus sec 5/3 staan of bekende afgeleiden zijn
const uit=[];
(function w(x,p){ if(typeof x==="string")uit.push([p,x]); else if(Array.isArray(x))x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>{ if(k.indexOf("TODO_BART")===0)return; w(x[k],p+"."+k)}); })(e,"E2");
const all=s5+"\n"+s3+"\n"+lines.join("\n").replace(/\*\*/g,"");
let nietGevonden=[];
uit.forEach(([p,s])=>{ if(all.indexOf(s)<0) nietGevonden.push([p,s]); });
console.log("data-strings (zonder TODO_BART):",uit.length,"niet letterlijk in casus:",nietGevonden.length);
nietGevonden.forEach(x=>console.log("  ",x[0],JSON.stringify(x[1])));
// 2. tekst uit sectie 5: alle tekst tussen aanhalingstekens en alle tabelcellen/bulletregels
const quotes=[...s5.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
console.log("\nquotes in sectie 5:",quotes.length);
const dataAlles=uit.map(x=>x[1]).join("\n")+"\n"+JSON.stringify(e);
quotes.forEach(q=>{ const inData=uit.some(([p,s])=>s===q||s.indexOf(q)>=0); console.log((inData?"OK   ":"MIS  ")+JSON.stringify(q)); });
// 3. bullets/tabelregels: elke "regel" in sectie 5 - toon welke woorden-reeksen niet in data staan (grof)
