const fs=require("fs"),vm=require("vm"),path=require("path");
const root="/home/user/epic-green-cards";
const orig=fs.readFileSync(root+"/engine/engine.js","utf8");
const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/engine.tests.js"];
const cache={};files.forEach(f=>{const p=path.join(root,f);cache[f]=fs.existsSync(p)?fs.readFileSync(p,"utf8"):null;});
function draai(src){const sb={console:{log(){},error(){}}};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  try{for(const f of files){if(cache[f]==null)continue;vm.runInContext(f==="engine/engine.js"?src:cache[f],sb,{filename:f,timeout:20000});}
  const r=vm.runInContext("Test.draaiAlles('engine')",sb,{timeout:60000});return r.filter(x=>!x.ok).map(x=>x.naam);}catch(e){return ["LAAD/TIMEOUT: "+String(e.message).slice(0,60)];}}
module.exports={draai,orig};
if(require.main===module){const t=Date.now();console.log(draai(orig).length,"rood basis",Date.now()-t,"ms");}
