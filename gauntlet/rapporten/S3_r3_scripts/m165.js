const fs=require("fs"),vm=require("vm");const root=__dirname+"/snap/";
let p=fs.readFileSync(root+"regels/predicaten.js","utf8").split("\n");
p[164]=p[164].replace("mids.indexOf(regel.kaart) >= 0","mids.indexOf(regel.kaart) > 0");
const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb));
vm.runInContext(p.join("\n"),sb);
["engine/engine.js","tests/testlib.js","tests/data-e2.tests.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb));
const r=sb.Test.draaiAlles("data-e2");console.log(r.filter(x=>!x.ok).length,"rood van",r.length);
r.filter(x=>!x.ok).forEach(x=>console.log(x.naam,x.fout));
