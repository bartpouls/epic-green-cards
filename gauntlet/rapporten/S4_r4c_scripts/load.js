globalThis.window = globalThis;
const vm = require("vm"), fs = require("fs");
const R = "/home/user/epic-green-cards/";
exports.R = R;
exports.laad = function (extra) {
  for (const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js"])
    vm.runInThisContext(fs.readFileSync(R + f, "utf8"), { filename: f });
  for (const f of (extra||[])) vm.runInThisContext(fs.readFileSync(f, "utf8"), { filename: f });
  return globalThis;
};
exports.ep3 = () => CASUSSEN[0].episodes.filter(e => e.id === "E3")[0];
exports.zetEp3 = (ep) => { const a = CASUSSEN[0].episodes; for (let i=0;i<a.length;i++) if (a[i].id==="E3") a[i]=ep; };
