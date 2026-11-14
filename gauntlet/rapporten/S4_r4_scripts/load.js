// Laadt casus + regels in een verse context; geeft helper terug.
const fs=require("fs"),vm=require("vm");
const root="/home/user/epic-green-cards";
exports.root=root;
exports.laad=function(opts){
  opts=opts||{};
  const sb={console:{log(){},error(){}},setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js"];
  for(const f of files){ if(f==="regels/evaluatie.js"&&opts.zonderEval) continue; vm.runInContext(fs.readFileSync(root+"/"+f,"utf8"),sb,{filename:f}); if(opts.naData&&f==="casussen/uwi-e3.js"){ const c=sb.CASUSSEN[0]; opts.naData(c.episodes.find(e=>e.id==="E3"),c);} }
  return sb;
};
