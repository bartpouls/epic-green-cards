// Mutatietest op regels/evaluatie.js. Gebruik: node mut_eval.js <aantal|alle> [seed]
const fs = require("fs"), path = require("path"), cp = require("child_process");
const SCR = "/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad";
const src = fs.readFileSync("/home/user/epic-green-cards/regels/evaluatie.js", "utf8");
// scanner: markeer posities in commentaar/strings
const skip = new Array(src.length).fill(false);
(function () {
  let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "*") { const e = src.indexOf("*/", i + 2) + 2; for (let k = i; k < e; k++) skip[k] = true; i = e; continue; }
    if (c === "/" && d === "/") { let e = src.indexOf("\n", i); if (e < 0) e = n; for (let k = i; k < e; k++) skip[k] = true; i = e; continue; }
    if (c === '"' || c === "'") { let k = i + 1; while (k < n && src[k] !== c) { if (src[k] === "\\") k++; k++; } for (let m = i; m <= k; m++) skip[m] = true; i = k + 1; continue; }
    i++;
  }
})();
const ops = [
  ["===", "!=="], ["!==", "==="], ["&&", "||"], ["||", "&&"], ["<=", ">"], [">=", "<"], ["<", ">="], [">", "<="],
  [".some(", ".every("], [".every(", ".some("], ["true", "false"], ["false", "true"], ["return null", "return undefined"],
  ["+ 1", "+ 0"], [" - 1", " - 0"], [".slice()", ""], ["Math.max", "Math.min"], ["Math.min", "Math.max"],
];
const muts = [];
for (const [a, b] of ops) {
  let i = -1;
  while ((i = src.indexOf(a, i + 1)) >= 0) {
    if (skip[i] || skip[i + a.length - 1]) continue;
    // niet midden in woord voor true/false
    if (/^(true|false)$/.test(a) && (/\w/.test(src[i - 1] || " ") || /\w/.test(src[i + a.length] || " "))) continue;
    muts.push({ start: i, end: i + a.length, rep: b, desc: a + " -> " + b });
  }
}
// negatie weghalen: "!" gevolgd door ( of letter, niet "!=" 
{ let i = -1; while ((i = src.indexOf("!", i + 1)) >= 0) { if (skip[i] || src[i + 1] === "=") continue; muts.push({ start: i, end: i + 1, rep: "", desc: "! verwijderd" }); } }
// getallen
{ const re = /\b(\d+)\b/g; let m; while ((m = re.exec(src))) { if (skip[m.index]) continue; if (m[1] === "0") muts.push({ start: m.index, end: m.index + 1, rep: "1", desc: "0 -> 1" }); else if (m[1] === "1") muts.push({ start: m.index, end: m.index + 1, rep: "0", desc: "1 -> 0" }); else if (m[1] === "3") muts.push({ start: m.index, end: m.index + 1, rep: "2", desc: "3 -> 2" }); } }
// specifiek: sorteervolgorde
muts.push({ start: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)"), end: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)") + "(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)".length, rep: "(b.inv.ernst - a.inv.ernst) || (a.idx - b.idx)", desc: "ernst omgekeerd" });
muts.push({ start: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)"), end: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)") + "(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)".length, rep: "(a.inv.ernst - b.inv.ernst) || (b.idx - a.idx)", desc: "gelijke ernst: laatste eerst" });
muts.push({ start: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)"), end: src.indexOf("(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)") + "(a.inv.ernst - b.inv.ernst) || (a.idx - b.idx)".length, rep: "(a.idx - b.idx)", desc: "sorteer op datavolgorde ipv ernst" });
function pick(arr, n, seed) { let s = seed; const r = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }
const want = process.argv[2] === "alle" ? muts.length : +process.argv[2] || 120;
const sel = pick(muts, want, +process.argv[3] || 7);
console.error("mutanten totaal " + muts.length + ", geselecteerd " + sel.length);
const resultaat = []; let next = 0, actief = 0; const W = 4;
function lijnVan(pos) { return src.slice(0, pos).split("\n").length; }
function start(w) {
  if (next >= sel.length) { if (actief === 0) klaar(); return; }
  const idx = next++, m = sel[idx]; actief++;
  const mutsrc = src.slice(0, m.start) + m.rep + src.slice(m.end);
  fs.writeFileSync(path.join(SCR, "w" + w, "regels/evaluatie.js"), mutsrc);
  cp.execFile("node", ["gauntlet/tools/run-node.js", "--json", "--groep=evaluatie"], { cwd: path.join(SCR, "w" + w), maxBuffer: 1e8 }, (err, out, serr) => {
    let rood = [], status;
    try { const j = JSON.parse(out); rood = j.resultaten.filter(r => !r.ok); status = rood.length ? "gedood" : "OVERLEEFD"; } catch (e) { status = "gedood(crash)"; }
    resultaat.push({ idx, lijn: lijnVan(m.start), desc: m.desc, tekst: src.slice(Math.max(0, m.start - 25), m.end + 25).replace(/\n/g, " "), status, rood: rood.length, groepen: [...new Set(rood.map(r => r.groep))] });
    actief--; start(w);
  });
}
function klaar() {
  resultaat.sort((a, b) => a.idx - b.idx);
  const over = resultaat.filter(r => r.status === "OVERLEEFD");
  console.log(JSON.stringify({ totaal: resultaat.length, gedood: resultaat.length - over.length, overleefd: over.length }));
  const alleenRoutes = resultaat.filter(r => r.status !== "OVERLEEFD" && r.groepen.length === 1 && r.groepen[0] === "evaluatie-routes").length;
  const alleenEval = resultaat.filter(r => r.status !== "OVERLEEFD" && r.groepen.length === 1 && r.groepen[0] === "evaluatie").length;
  console.log("gedood alleen door routes: " + alleenRoutes + ", alleen door evaluatie-unit: " + alleenEval);
  over.forEach(r => console.log("OVERLEEFD @" + r.lijn + " [" + r.desc + "] ..." + r.tekst));
  fs.writeFileSync(path.join(__dirname, "mut_eval_resultaat.json"), JSON.stringify(resultaat, null, 1));
}
for (let w = 0; w < W; w++) start(w);
