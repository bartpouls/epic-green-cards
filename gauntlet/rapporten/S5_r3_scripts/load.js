const fs=require("fs"),vm=require("vm"),path=require("path");
const root="/home/user/epic-green-cards";
const sb={console,setTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js"]) vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),sb,{filename:f});
module.exports=sb;
