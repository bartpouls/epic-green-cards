// Laadt de lagen (zoals run-node) in deze proces. Opties: { evaluatieBron: string|fn(bron)->bron, data: fn() na laden data, zonderTests: true }
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "../../..");
globalThis.window = globalThis;
function laad(opts) {
  opts = opts || {};
  const files = ["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js", "regels/predicaten.js", "regels/evaluatie.js", "engine/engine.js"];
  for (const f of files) {
    let src = fs.readFileSync(path.join(root, f), "utf8");
    if (f === "regels/evaluatie.js" && opts.evaluatieBron) src = typeof opts.evaluatieBron === "function" ? opts.evaluatieBron(src) : opts.evaluatieBron;
    if (f === "regels/predicaten.js" && opts.predicatenBron) src = opts.predicatenBron(src);
    vm.runInThisContext(src, { filename: f });
    if (f === "casussen/uwi-e3.js" && opts.data) opts.data(globalThis.CASUSSEN[0]);
  }
}
// casus-vragen uit casus-uwi.md (onafhankelijk van de data)
function casusVragen() {
  const md = fs.readFileSync(path.join(root, "casus-uwi.md"), "utf8").split("\n");
  const m = {};
  let sectie = "";
  for (const l of md) {
    const h = /^## (\d)\./.exec(l); if (h) sectie = h[1];
    const r = /^\| ([^|]+?) \| "(.*)" \|$/.exec(l);
    if (r) m[sectie + ":" + r[1]] = r[2];
    const z = /^- \*\*([^*]+):\*\* "(.*)"$/.exec(l);
    if (z) m[sectie + ":zicht:" + z[1]] = z[2];
  }
  return m;
}
module.exports = { laad, root, casusVragen };
