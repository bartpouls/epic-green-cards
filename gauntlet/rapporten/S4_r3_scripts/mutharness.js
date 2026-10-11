const fs=require("fs"),path=require("path"),vm=require("vm");
const root="/home/user/epic-green-cards";
const data=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"];
const lib=["regels/predicaten.js","engine/engine.js","tests/testlib.js"];
const cache={};function src(f){return cache[f]||(cache[f]=fs.readFileSync(f.startsWith("/")?f:path.join(root,f),"utf8"));}
exports.run=function(mutfn,testfile){
  const sb={console:{log(){},error(){}},setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  for(const f of data) vm.runInContext(src(f),sb,{filename:f});
  const c=sb.CASUSSEN[0];const e3=c.episodes.find(e=>e.id==="E3");
  if(mutfn) mutfn(e3,c);
  for(const f of lib) vm.runInContext(src(f),sb,{filename:f});
  vm.runInContext(src(testfile||"tests/data-e3.tests.js"),sb,{filename:"t"});
  const res=sb.Test.draaiAlles("data-e3");
  return {fails:res.filter(r=>!r.ok).map(r=>r.naam),n:res.length};
};
exports.basis=function(tf){return exports.run(null,tf);};
