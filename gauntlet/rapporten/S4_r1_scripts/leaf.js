const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards/";
const md=fs.readFileSync(root+"casus-uwi.md","utf8").replace(/\*\*/g,"");
const sb={console};sb.window=sb;vm.createContext(sb);
["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb));
const c=sb.CASUSSEN[0],e3=c.episodes.find(e=>e.id==="E3");
const uit=[];(function w(x,p){if(typeof x==="string"){uit.push([p,x]);}else if(Array.isArray(x))x.forEach((v,i)=>w(v,p+"["+i+"]"));else if(x&&typeof x==="object")Object.keys(x).forEach(k=>w(x[k],p+"."+k));})(e3,"E3");
let nee=0;
for(const [p,s] of uit){ if(/TODO_BART/.test(p)) continue; if(s.length<6) continue; if(!md.includes(s)){ nee++; console.log(p,"=>",JSON.stringify(s).slice(0,150)); } }
console.log("niet-letterlijk-in-casus (structureel/afgeleid):",nee,"van",uit.length);
