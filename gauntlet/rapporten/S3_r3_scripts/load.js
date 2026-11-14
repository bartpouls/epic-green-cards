const fs=require("fs"),vm=require("vm");
const root=__dirname+"/snap/";
exports.root=root;
exports.laad=function(extra){
  const sb={console,Math:Object.create(Math)};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"].forEach(f=>{ if(fs.existsSync(root+f)) vm.runInContext(fs.readFileSync(root+f,"utf8"),sb,{filename:f}); });
  return sb;
};
