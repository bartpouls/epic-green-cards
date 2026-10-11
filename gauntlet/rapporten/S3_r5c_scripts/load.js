const fs=require('fs'),vm=require('vm'),path=require('path');
exports.load=function(root,opts){
  opts=opts||{};
  const sb={console,setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  const files=['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','regels/predicaten.js','regels/evaluatie.js','engine/engine.js','tests/testlib.js'];
  if(!opts.zonderTests) files.push('tests/data-e2.tests.js');
  for(const f of files){
    const p=(opts.over&&opts.over[f])||path.join(root,f);
    if(!fs.existsSync(p)) continue;
    vm.runInContext(fs.readFileSync(p,'utf8'),sb,{filename:f});
  }
  return sb;
};
