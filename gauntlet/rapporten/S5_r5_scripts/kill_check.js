const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const t=fs.readFileSync(__dirname+"/mut_crit5.js","utf8");const m=t.slice(t.indexOf("const M=["),t.indexOf("];\nlet dood")+2);const M=eval("(function(){"+m+" return M;})()");
const src=fs.readFileSync(root+"/regels/predicaten.js","utf8");
const c2=fs.readFileSync(__dirname+"/crit_claims2.js","utf8").replace('const sb=require("../S5_r3_scripts/load.js");const P=sb.Predicaten;','const P=globalThis.Predicaten;');
for(const id of ["C58","D13","D14","D22","D05","D06","D11","D25","C57","C113"]){const [n,a,b]=M.find(x=>x[0].startsWith(id+" "));
 const sb={console:{log(){}}};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(src.replace(a,()=>b),sb);
 let bad=0;sb.console.log=(...x)=>{if(/FAIL/.test(x[0]))bad++;};vm.runInContext(c2.replace('const casus','const casus'),sb);console.log(id,"gedood door claims2:",bad>0);}
