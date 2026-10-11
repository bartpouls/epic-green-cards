const H = require("./harness.js");
const SP = "spironolacton", L875 = "875/125 mg 2 dd";
const G = "G1"; // filler
// Basisroutes (geldig). AB: A na kaart 4, B na kaart 7. BA1: B na kaart 4, A na kaart 7 (met B1 + V6 op dezelfde dag).
const BASE = {
  AB: [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []],
  BA: [["G3", "O1", "V4"], ["N1"], [["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3", "Ev1", "O2"], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["Ev2", SP]], []],
};
const clone = x => JSON.parse(JSON.stringify(x));
const sleutel = k => (Array.isArray(k) ? k.join("|") : k);
function ver(d, dag, van, naar) { // vervang kaart in dag (1-gebaseerd); naar=null: verwijder
  const i = d[dag - 1].findIndex(k => sleutel(k) === sleutel(van));
  if (i < 0) throw new Error("kaart " + sleutel(van) + " niet in dag " + dag);
  if (naar === null) d[dag - 1].splice(i, 1); else d[dag - 1][i] = naar; return d;
}
function plus(d, dag, k) { d[dag - 1].push(k); return d; }
const M = []; // {inv, naam, order, bouw(base)}
function m(inv, naam, bouw) { ["AB", "BA"].forEach(o => M.push({ inv, naam, order: o, dagen: bouw(clone(BASE[o]), o) })); }
m("OK", "basis (geldig)", d => d);
m("I1", "N1 ontbreekt (G1 als vulling)", d => ver(d, 2, "N1", G));
m("I4", "tweede antibioticum erbij (V4 opnieuw, laat)", (d, o) => plus(d, o === "AB" ? 6 : 7, "V4"));
m("I5", "nitrofurantoine i.p.v. fosfomycine", d => ver(d, 1, "V4", "V3"));
m("I6a", "antibioticum vóór O1", d => { d[0] = ["G3", "V4", "O1"]; return d; });
m("I6b", "afwachtend beleid V1 erbij", (d, o) => plus(d, o === "AB" ? 6 : 7, "V1"));
m("I6c", "uitgesteld recept V2 erbij", (d, o) => plus(d, o === "AB" ? 6 : 7, "V2"));
m("I7a", "trimethoprim, O2 dag 2-4, V6 halveren ontbreekt", (d, o) => { ver(d, 1, "V4", "V5"); if (o === "AB") { ver(d, 2, "O2", G); plus(d, 5, "O2"); } return d; });
m("I7b", "trimethoprim zonder O2 (Ev2 voor I9)", (d, o) => { ver(d, 1, "V4", "V5"); if (o === "AB") ver(d, 2, "O2", G); else ver(d, 4, "O2", G); return d; });
m("I9a", "geen O2 én geen Ev2", (d, o) => { if (o === "AB") { ver(d, 2, "O2", G); ver(d, 2, ["Ev2", SP], G); } else { ver(d, 4, "O2", G); ver(d, 6, ["Ev2", SP], G); } return d; });
m("I9b", "B5 spironolacton zonder Ev2 ervoor (O2 wel)", (d, o) => { if (o === "AB") { ver(d, 2, ["Ev2", SP], G); plus(d, 6, ["B5", SP]); } else { ver(d, 6, ["Ev2", SP], G); plus(d, 7, ["B5", SP]); } return d; });
m("I10", "fosfomycine blijft na A (+Ev3 tegen I16)", (d, o) => { if (o === "AB") { d[2] = ["O1", "Ev1", G]; plus(d, 5, "Ev3"); } else { d[4] = ["O1", "Ev1", G]; plus(d, 6, "Ev3"); } return d; });
m("I11", "wisselen zonder nieuwe O1 na A", (d, o) => { ver(d, o === "AB" ? 3 : 5, "O1", G); return d; });
m("I12", "cotrimoxazol i.p.v. fosfomycine", d => ver(d, 1, "V4", "V9"));
m("I13a", "amox/clav zonder V6", (d, o) => ver(d, o === "AB" ? 3 : 5, ["V6", "V8", L875], G));
m("I13b", "amox/clav met V6 500/125 mg 2 dd", (d, o) => ver(d, o === "AB" ? 3 : 5, ["V6", "V8", L875], ["V6", "V8", "500/125 mg 2 dd"]));
m("I14a", "cipro zonder B4/B3 (+Ev3 tegen I16)", (d, o) => { const dg = o === "AB" ? 3 : 5; ver(d, dg, ["B1", "V8"], ["B1", "V7"]); ver(d, dg, ["V6", "V8", L875], G); plus(d, o === "AB" ? 5 : 6, "Ev3"); return d; });
m("I14b", "cipro, B4 pas twee dagen later (+Ev3 niet nodig)", (d, o) => { const dg = o === "AB" ? 3 : 5; ver(d, dg, ["B1", "V8"], ["B1", "V7"]); ver(d, dg, ["V6", "V8", L875], G); plus(d, dg + 2, ["B4", "V7"]); return d; });
m("I15a", "N3 ontbreekt", (d, o) => ver(d, o === "AB" ? 5 : 4, "N3", G));
m("I15b", "lisinopril niet gehalveerd", (d, o) => ver(d, o === "AB" ? 4 : 3, ["V6", "lisinopril", "halveren"], G));
m("I15c", "spironolacton niet gestopt", (d, o) => ver(d, o === "AB" ? 4 : 3, ["B3", SP], G));
m("I15d", "lisinopril 'stoppen' i.p.v. halveren", (d, o) => ver(d, o === "AB" ? 4 : 3, ["V6", "lisinopril", "halveren"], ["V6", "lisinopril", "stoppen"]));
m("I16a", "geen Ev1 binnen 2 beurten na A", (d, o) => { if (o === "AB") { ver(d, 4, "Ev1", null); plus(d, 5, "Ev1"); } else { ver(d, 6, "Ev1", G); } return d; });
m("I16b", "stoppen na A, 48u geen verbetering, geen Ev3", (d, o) => { if (o === "AB") { d[2] = ["O1", ["B2", "V4"], "Ev1"]; plus(d, 5, "Ev1"); } else { d[4] = ["O1", ["B2", "V4"], "Ev1"]; } return d; });
const only = process.argv[2];
let slecht = 0;
for (const x of M) {
  if (only && x.inv !== only && x.naam.indexOf(only) < 0) continue;
  const sb = H.laad();
  let res;
  try { res = H.speel(sb, x.dagen, { volgorde: x.order }); } catch (e) { console.log((x.inv + " " + x.order).padEnd(8), x.naam, "FOUT", e.message); slecht++; continue; }
  const ids = res.uit.geschonden.map(g => g.id);
  const verwacht = x.inv === "OK" ? [] : [x.inv.replace(/[a-z]$/, "")];
  const goed = JSON.stringify(ids) === JSON.stringify(verwacht);
  if (!goed) slecht++;
  console.log((goed ? "ok  " : "BAD ") + (x.inv + " " + x.order).padEnd(8), x.naam.padEnd(52), H.samenvat(res), goed ? "" : "  <-- verwacht " + verwacht.join(","));
}
console.log("\nafwijkend van verwachting:", slecht);
