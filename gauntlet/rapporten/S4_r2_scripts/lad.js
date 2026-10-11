const fs=require("fs"),vm=require("vm");
const root="/home/user/epic-green-cards";
function laad(extra){
  extra=extra||process.env.MUT||undefined;
  const sb={console,setTimeout}; sb.window=sb; sb.globalThis=sb; vm.createContext(sb);
  const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js",extra||"casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"];
  for(const f of files){ const src=(f.startsWith("/")?fs.readFileSync(f,"utf8"):fs.readFileSync(root+"/"+f,"utf8")); vm.runInContext(src,sb,{filename:f}); }
  return sb;
}
module.exports={laad,root};
if(require.main===module){
 const sb=laad(); const c=sb.CASUSSEN[0];
 console.log(JSON.stringify(c.rollen));
 for(const k of c.kaarten){ if(["V6","B1","B2","B3","B4","B5","N2","Ev2","V7","V8"].includes(k.id)) console.log(k.id, JSON.stringify(k.doelen&&k.doelen.E3), JSON.stringify(k.opties)); }
 console.log(c.episodes.map(e=>e.id));
}
