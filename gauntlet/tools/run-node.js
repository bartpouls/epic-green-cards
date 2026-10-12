// Draait dezelfde bestanden als tests/tests.html headless in Node. Gebruik: node gauntlet/tools/run-node.js [--json] [--groep=tekst]
// Exitcode 1 bij rood of als er geen tests zijn.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "../..");
// Draait in de hoofdcontext (vm.runInThisContext): globals als Object/Array zijn in een aparte vm-context ~8x trager.
const sandbox = globalThis; sandbox.window = globalThis;
const bestanden = [
  "casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js",
  "regels/predicaten.js", "regels/evaluatie.js", "engine/engine.js", "engine/logging.js", "ui/ui.js", "casussen/uwi-referentie.js",
  "tests/testlib.js",
  "tests/data-kaarten.tests.js", "tests/data-e1.tests.js", "tests/data-e2.tests.js", "tests/data-e3.tests.js", "tests/data-referentie.tests.js",
  "tests/predicaten.tests.js", "tests/routes.js", "tests/evaluatie.tests.js", "tests/engine.tests.js", "tests/logging.tests.js", "tests/ui.tests.js"
];
const geladen = [], overgeslagen = [];
for (const f of bestanden) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { overgeslagen.push(f); continue; }
  try { vm.runInThisContext(fs.readFileSync(p, "utf8"), { filename: f }); geladen.push(f); }
  catch (e) { console.error("LAADFOUT in " + f + ": " + e.message); process.exit(2); }
}
const args = process.argv.slice(2);
const filter = (args.find(a => a.startsWith("--groep=")) || "").slice(8);
const sel = sandbox.Test ? sandbox.Test.draaiAlles(filter || undefined) : [];
if (args.includes("--json")) console.log(JSON.stringify({ geladen, overgeslagen, resultaten: sel }, null, 1));
else {
  for (const r of sel) console.log((r.ok ? "PASS " : "FAIL ") + "[" + r.groep + "] " + r.naam + (r.ok ? "" : "\n     " + r.fout));
  const rood = sel.filter(r => !r.ok).length;
  console.log("\n" + (sel.length - rood) + " groen, " + rood + " rood, " + sel.length + " totaal. Geladen: " + geladen.length + ", overgeslagen: " + overgeslagen.length);
}
process.exit(sel.length === 0 || sel.some(r => !r.ok) ? 1 : 0);
