// Draait de tests met een datamutatie. Env MUTSPEC = JSON {pad:[...], waarde:..} ; argv[2] = groepfilter (substring) of "ALLES"; cwd = werkkopie
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = process.cwd();
globalThis.window = globalThis;
const bestanden = ["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js", "regels/predicaten.js", "regels/evaluatie.js", "engine/engine.js", "engine/logging.js", "tests/testlib.js",
  "tests/data-kaarten.tests.js", "tests/data-e1.tests.js", "tests/data-e2.tests.js", "tests/data-e3.tests.js", "tests/predicaten.tests.js", "tests/routes.js", "tests/evaluatie.tests.js", "tests/engine.tests.js", "tests/logging.tests.js"];
const spec = process.env.MUTSPEC ? JSON.parse(process.env.MUTSPEC) : null;
function zet(obj, pad, waarde) { let o = obj; for (let i = 0; i < pad.length - 1; i++) o = o[pad[i]]; const l = pad[pad.length - 1]; if (waarde === "__verwijder__") { if (Array.isArray(o)) o.splice(l, 1); else delete o[l]; } else if (waarde && waarde.__vervang_door_arg__ !== undefined) { o[l] = waarde.__vervang_door_arg__; } else o[l] = waarde; }
for (const f of bestanden) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), "utf8"), { filename: f });
  if (f === "casussen/uwi-e3.js" && spec) {
    let o = globalThis.CASUSSEN[0]; zet(o, spec.pad, spec.waarde);
  }
}
const filter = process.argv[2] === "ALLES" ? undefined : process.argv[2];
const uit = Test.draaiAlles(filter).filter(r => !filter || true);
const rood = uit.filter(r => !r.ok);
const groepen = {}; rood.forEach(r => groepen[r.groep] = (groepen[r.groep] || 0) + 1);
console.log(JSON.stringify({ totaal: uit.length, rood: rood.length, groepen, eerste: rood.slice(0, 2).map(r => r.groep + ": " + r.naam) }));
