const fs=require("fs"),path=require("path"),vm=require("vm");
const root="/home/user/epic-green-cards";
exports.root=root;
exports.laad=function(opts){
  opts=opts||{};
  const sb={console,setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  const files=opts.files||["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"];
  for(const f of files){
    let src=fs.readFileSync(path.join(opts.root||root,f),"utf8");
    if(opts.mut&&opts.mut.file===f) src=opts.mut.fn(src);
    vm.runInContext(src,sb,{filename:f});
  }
  return sb;
};
