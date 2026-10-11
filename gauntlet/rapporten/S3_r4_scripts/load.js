const fs=require('fs'),vm=require('vm'),path=require('path');
exports.load=function(root,over){
  over=over||{};
  const sb={console,setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','regels/predicaten.js','engine/engine.js','tests/testlib.js','tests/data-e2.tests.js']){
    if(over.__sloptests&&f.startsWith('tests/')&&f!=='tests/testlib.js') continue; const p=over[f]||path.join(root,f);
    vm.runInContext(fs.readFileSync(p,'utf8'),sb,{filename:f});
  }
  return sb;
};
