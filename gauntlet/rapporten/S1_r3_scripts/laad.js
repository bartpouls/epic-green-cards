// Laadt de data (uwi.js + episodes) in een vm-context; geeft { casus, sandbox, vm, laadTestlibEnz }
const fs=require('fs'),path=require('path'),vm=require('vm');
const root='/home/user/epic-green-cards';
function maak(opts){
  opts=opts||{};
  const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  const files=opts.files||['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','regels/predicaten.js','engine/engine.js'];
  files.forEach(f=>{const src=(opts.override&&opts.override[f])??fs.readFileSync(path.join(root,f),'utf8');vm.runInContext(src,sb,{filename:f});});
  return sb;
}
module.exports={maak,root};
