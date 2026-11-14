const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const src=fs.readFileSync(root+"/regels/predicaten.js","utf8");
function draai(code,{scen}={}){
  const sb={console:{log(){},error(){}},setTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  try{
    vm.runInContext(code,sb,{filename:"predicaten.js"});
    vm.runInContext(fs.readFileSync(root+"/tests/testlib.js","utf8"),sb);
    vm.runInContext(fs.readFileSync(root+"/tests/predicaten.tests.js","utf8"),sb);
  }catch(e){return {laad:true,rood:["LAADFOUT "+e.message],n:0};}
  const r=sb.Test.draaiAlles("predicaten");
  return {rood:r.filter(x=>!x.ok).map(x=>x.naam),n:r.length};
}
module.exports={src,draai,root};
