// data-e1 in Node ZONDER vm-context (klassieke scripts in het hoofd-realm via indirect eval)
const fs=require("fs");const root="/home/user/epic-green-cards/";const PRED=process.argv[2]?fs.readFileSync(process.argv[2],"utf8"):null;
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/data-e1.tests.js"]) if(fs.existsSync(root+f)) (0,eval)((f==="regels/predicaten.js"&&PRED)?PRED:fs.readFileSync(root+f,"utf8"));
const t=Date.now();const r=Test.draaiAlles("data-e1");console.log("data-e1 plain node:",((Date.now()-t)/1000).toFixed(1)+"s",r.length,"tests, rood:",r.filter(x=>!x.ok).length);
