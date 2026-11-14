const fs=require("fs"),path=require("path"),vm=require("vm");
const root="/home/user/epic-green-cards";
function laad(engineSrc,extra){
  const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js"]){
    const p=path.join(root,f); if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p,"utf8"),sb,{filename:f});
  }
  vm.runInContext(engineSrc!=null?engineSrc:fs.readFileSync(root+"/engine/engine.js","utf8"),sb,{filename:"engine.js"});
  if(!sb.Evaluatie) sb.Evaluatie={beoordeel:function(c,e,s){return {stub:true,n:s.tijdlijn.length};}};
  return sb;
}
module.exports={laad,root};
