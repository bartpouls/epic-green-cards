// Telt en timet evalueer-aanroepen per test in data-e1
const fs=require("fs"),path=require("path"),vm=require("vm");
const root="/home/user/epic-green-cards";
const sb={console,setTimeout,clearTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/data-kaarten.tests.js","tests/data-e1.tests.js"])
 { if(fs.existsSync(path.join(root,f))) vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),sb,{filename:f}); }
const P=sb.Predicaten;const orig={ev:P.evalueer,tel:P.tel};
let n=0,t=0n,nt=0;
P.evalueer=function(a,b){n++;const s=process.hrtime.bigint();try{return orig.ev(a,b);}finally{t+=process.hrtime.bigint()-s;}};
P.tel=function(a,b){nt++;return orig.tel(a,b);};
const res=sb.Test.draaiAlles("data-e1");
console.log("evalueer-aanroepen:",n,"tel:",nt,"tijd in evalueer ms:",Number(t)/1e6);
