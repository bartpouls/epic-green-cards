const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js",process.env.ENG||"engine/engine.js","casussen/uwi-referentie.js"]) vm.runInThisContext(fs.readFileSync((f[0]==="/"?"":root+"/")+f,"utf8"),{filename:f});
