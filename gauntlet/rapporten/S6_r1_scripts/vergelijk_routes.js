const fs = require("fs");
const { laad, casusVragen, root } = require("./laad.js"); laad();
require(root + "/tests/testlib.js");
require("vm").runInThisContext(fs.readFileSync(root + "/tests/routes.js", "utf8"));
const R = Routes, Q = casusVragen();
const md = fs.readFileSync(root + "/casus-uwi.md", "utf8").split("\n");
// kaarttabel
const kaarten = {}; let inTab = false;
for (const l of md) { if (/^\| Id \| Categorie \| Label/.test(l)) { inTab = true; continue; } if (inTab) { if (!l.startsWith("|")) break; if (/^\|---/.test(l)) continue; const c = l.split(" | ").map(x => x.replace(/^\| /, "").replace(/ \|$/, "")); kaarten[c[0]] = { downside: c[5], label: c[2] }; } }
let fouten = 0;
const chk = (naam, a, b) => { if (a !== b) { fouten++; console.log("AFWIJKING", naam, "\n  routes.js:", JSON.stringify(a), "\n  casus:    ", JSON.stringify(b)); } };
const map = { I1: "4:I1", I3: "4:I3", I4: "4:I4", I5: "5:I5", I6geenKweek: "5:I6, geen kweek", I6afwachten: "5:I6, afwachten", I7kalium: "5:I7, geen kalium", I7halveren: "5:I7, niet gehalveerd", I8: "5:I8", I9: "6:I9", I10: "6:I10", I11: "6:I11", I12: "6:I12", I13: "6:I13", I14: "6:I14", I15: "6:I15", I16: "6:I16" };
for (const k in map) chk("VRAAG." + k, R.VRAAG[k], Q[map[k]]);
chk("EXTRA.O1", R.EXTRA.O1, Q["4:O1 gespeeld"]); chk("EXTRA.eGFR", R.EXTRA.eGFR, Q["5:Verouderde eGFR niet opgemerkt"]); chk("EXTRA.gewisseld", R.EXTRA.gewisseld, Q["5:Onnodig gewisseld"]);
chk("EXTRA.herstart", R.EXTRA.herstart, Q["6:Automatische herstart"]); chk("EXTRA.cipro", R.EXTRA.cipro, Q["6:Ciprofloxacine-dosis (bronconflict)"]);
chk("ZICHT.N1", R.ZICHT.N1, Q["4:zicht:Zonder N1"]); chk("ZICHT.V1", R.ZICHT.V1, Q["4:zicht:V1 zonder Ev1"]); chk("ZICHT.V3", R.ZICHT.V3, Q["5:zicht:Nitrofurantoïne zonder G2"]); chk("ZICHT.V5", R.ZICHT.V5, Q["5:zicht:V5 zonder O2"]); chk("ZICHT.cipro", R.ZICHT.cipro, Q["6:zicht:Ciprofloxacine zonder B4/B3"]); chk("ZICHT.I9", R.ZICHT.I9, Q["6:zicht:I9 gemist"]);
chk("REFL.terug", R.REFLECTIE.terughoudend, Q["4:Profiel terughoudend"]); chk("REFL.direct", R.REFLECTIE.direct, Q["4:Profiel direct behandelen"]); chk("REFL.cipro", R.REFLECTIE.cipro, Q["6:Profiel ciprofloxacine"]);
// downsides
for (const id in kaarten) {
  const d = R.DOWNSIDE[id]; const c = kaarten[id].downside;
  let verwacht = c;
  if (id === "O1") verwacht = c.replace(/^E1: /, "");
  const echt = (d && typeof d === "object") ? d.E1 : d;
  chk("DOWNSIDE." + id, echt, verwacht);
}
console.log("routes.js: " + R.lijst.length + " routes; afwijkingen tov casus: " + fouten);
console.log("zichtbaar sick-day-zin in routes.js:", R.ZICHT.sickday);
