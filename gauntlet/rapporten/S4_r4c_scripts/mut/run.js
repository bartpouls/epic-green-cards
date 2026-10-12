// gebruik: node run.js <k> <N> [zonderpin|origineel]  -> schrijft jsonl naar out<k>.jsonl
const path = require("path"), fs = require("fs");
const SP = path.resolve(__dirname, "..");
const L = require(SP + "/load.js");
const testBestand = process.argv[4] === "origineel" ? L.R + "tests/data-e3.tests.js" : SP + "/data-e3.zonderpin.js";
L.laad([L.R + "tests/testlib.js", testBestand]);
const G = require("./genmut.js");
const orig = JSON.parse(JSON.stringify(L.ep3()));
const origTodo = JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts = G.genereer(orig, origTodo);
const k = +process.argv[2], N = +process.argv[3];
const out = fs.openSync(SP + "/mut/out2_" + k + (process.argv[4] === "origineel" ? "_orig" : "") + ".jsonl", "w");
const SEL = fs.existsSync(__dirname + "/sel.json") ? new Set(JSON.parse(fs.readFileSync(__dirname + "/sel.json", "utf8"))) : null;
const base = Test.draaiAlles("data-e3").filter(r => !r.ok);
if (base.length) { console.error("basis niet groen:", base.map(r => r.naam)); process.exit(3); }
let n = 0;
for (const m of muts) {
  if (SEL && !SEL.has(m.id)) continue; if ((SEL ? [...SEL].indexOf(m.id) : m.id) % N !== k) continue;
  const root = { ep: JSON.parse(JSON.stringify(orig)), todo: JSON.parse(JSON.stringify(origTodo)) };
  try { G.pas(root, m); } catch (e) { fs.writeSync(out, JSON.stringify({ id: m.id, fout: "pas: " + e.message }) + "\n"); continue; }
  // vervang ep en todo (alleen E3-todo's)
  L.zetEp3(root.ep);
  CASUSSEN[0].todoBart = root.todo;
  let res;
  try { res = Test.draaiAlles("data-e3"); } catch (e) { res = [{ ok: false, naam: "CRASH " + e.message }]; }
  const rood = res.filter(r => !r.ok).map(r => r.naam);
  fs.writeSync(out, JSON.stringify({ id: m.id, soort: m.soort, desc: m.desc, killed: rood.length > 0, n: rood.length, first: rood.slice(0, 3) }) + "\n");
  n++;
}
L.zetEp3(orig); CASUSSEN[0].todoBart = origTodo;
console.error("klaar", k, n);
