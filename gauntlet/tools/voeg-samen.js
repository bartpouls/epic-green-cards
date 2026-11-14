// Voegt de speldata samen tot één casussen/uwi.js (bouwopdracht §2): uwi.js + uwi-e1.js + uwi-e2.js + uwi-e3.js.
// casussen/uwi-referentie.js (beschrijvende casustekst voor het overzicht, S11) blijft bewust een apart bestand.
// Gebruik: node gauntlet/tools/voeg-samen.js [--check]   (--check schrijft niets; vergelijkt alleen)
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "../..");
const delen = ["uwi.js", "uwi-e1.js", "uwi-e2.js", "uwi-e3.js"].map(f => path.join(root, "casussen", f));
function laad(bestanden) {
  const sb = { console }; sb.window = sb; vm.createContext(sb);
  bestanden.forEach(f => vm.runInContext(fs.readFileSync(f, "utf8"), sb, { filename: f }));
  return JSON.stringify(sb.window.CASUSSEN);
}
const voor = laad(delen);
const kop = "/* casussen/uwi.js — samengevoegd uit uwi.js (kop + kaarten), uwi-e1.js, uwi-e2.js en uwi-e3.js. Alleen data, geen logica.\n   Bron: casus-uwi.md (v1.1). Gemaakt met gauntlet/tools/voeg-samen.js; de losse bestanden zijn daarna vervallen. */\n";
const samen = kop + delen.map(f => "/* ===== " + path.basename(f) + " ===== */\n" + fs.readFileSync(f, "utf8").replace(/\s+$/, "") + "\n").join("\n");
const tmp = path.join(require("os").tmpdir(), "uwi-samen-" + process.pid + ".js");
fs.writeFileSync(tmp, samen);
const na = laad([tmp]);
fs.unlinkSync(tmp);
if (voor !== na) { console.error("VERSCHIL: de samengevoegde data wijkt af van de losse bestanden. Niets geschreven."); process.exit(1); }
console.log("Identiek: " + voor.length + " tekens JSON voor en na samenvoegen.");
if (process.argv.includes("--check")) process.exit(0);
fs.writeFileSync(delen[0], samen);
delen.slice(1).forEach(f => fs.unlinkSync(f));
console.log("Geschreven: casussen/uwi.js (" + samen.length + " tekens). Verwijderd: uwi-e1.js, uwi-e2.js, uwi-e3.js.");
