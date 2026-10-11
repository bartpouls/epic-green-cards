const fs=require("fs"),path=require("path"),vm=require("vm");
const root="/home/user/epic-green-cards";
const sb={console,setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
let reg=[];
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js"])
 { if(fs.existsSync(path.join(root,f))) vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),sb,{filename:f}); }
const T=sb.Test, r0=T.registreer; T.registreer=function(g,n,fn){reg.push([g,n,fn]);r0(g,n,fn);};
vm.runInContext(fs.readFileSync(path.join(root,"tests/data-e1.tests.js"),"utf8"),sb,{filename:"data-e1"});
const P=sb.Predicaten;const o=P.evalueer;let n=0;P.evalueer=function(a,b){n++;return o(a,b);};
for(const [g,nm,fn] of reg){n=0;const t=Date.now();try{fn();}catch(e){console.log("FAIL",e.message)}console.log(((Date.now()-t)/1000).toFixed(1)+"s",n,"calls",nm.slice(0,110));}
