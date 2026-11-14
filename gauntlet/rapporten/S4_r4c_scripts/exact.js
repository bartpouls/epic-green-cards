const L = require("./load.js"); L.laad();
const fs = require("fs");
const md = fs.readFileSync(L.R + "casus-uwi.md", "utf8");
const strip = s => s.replace(/\*\*/g, "");
const lines = md.split("\n").map(strip);
const ep = L.ep3();
let n = 0, bad = 0;
function eq(label, got, want) { n++; if (got !== want) { bad++; console.log("AFWIJKING", label, "\n  data :", JSON.stringify(got), "\n  casus:", JSON.stringify(want)); } }
const cells = ln => ln.split("|").slice(1, -1).map(c => c.trim());
const unq = s => s.replace(/^"(.*)"$/, "$1");
const rows = {};
lines.forEach((ln, i) => { if (/^\|\s*I\d+\s*\|/.test(ln) && !/^\|\s*I\d+\s*\|\s*"/.test(ln)) { const c = cells(ln); const id = c[0]; (rows[id] = rows[id] || []).push({ c, i: i + 1 }); } });
const inv = id => ep.invarianten.filter(x => x.id === id)[0];
// Invariantentabellen
for (const id of ["I1", "I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]) {
  const r = rows[id]; const d = inv(id);
  if (!d) { console.log("ONTBREEKT", id); bad++; continue; }
  const c = r[r.length - 1].c; // sectie 6 rij voor I9+, voor I5-8 de sectie 5 rij, I1/I4 sectie 4
  const r4 = r.filter(x => x.i < 165).pop(), r5 = r.filter(x => x.i >= 166 && x.i < 235).pop(), r6 = r.filter(x => x.i >= 235).pop();
  const bron = r6 || r5 || r4;
  eq(id + ".altijdFout", d.altijdFout, bron.c[1]);
  if (r6) { eq(id + ".geldtInTekst", d.geldtInTekst, bron.c[2]); eq(id + ".bron", d.bron, bron.c[3]); }
  else eq(id + ".bron", d.bron, bron.c[2]);
}
// vragen uit feedbacktabellen
const fb = {};
lines.forEach((ln, i) => { if (/^\|\s*[^|]+\|\s*"/.test(ln)) { const c = cells(ln); (fb[c[0]] = fb[c[0]] || []).push({ v: unq(c[1]), i: i + 1 }); } });
const vr = (t, i) => fb[t].filter(x => i == null || (i === 6 ? x.i >= 235 : i === 5 ? x.i >= 166 && x.i < 235 : x.i < 165)).pop().v;
eq("I1.vraag", inv("I1").vraag, vr("I1", 4)); eq("I4.vraag", inv("I4").vraag, vr("I4", 4));
eq("I5.vraag", inv("I5").vraag, vr("I5", 5));
eq("I6.vraag(variant0)", inv("I6").vraagVarianten[0].vraag, vr("I6, geen kweek", 5)); eq("I6.vraag(variant1)", inv("I6").vraagVarianten[1].vraag, vr("I6, afwachten", 5));
eq("I6.vraag", inv("I6").vraag, vr("I6, geen kweek", 5));
eq("I7.vraag", inv("I7").vraag, vr("I7, geen kalium", 5)); eq("I7.v0", inv("I7").vraagVarianten[0].vraag, vr("I7, geen kalium", 5)); eq("I7.v1", inv("I7").vraagVarianten[1].vraag, vr("I7, niet gehalveerd", 5));
eq("I8.vraag", inv("I8").vraag, vr("I8", 5));
for (const id of ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]) eq(id + ".vraag", inv(id).vraag, vr(id, 6));
// feedbackExtra, profielen
const fx = ep.feedbackExtra; eq("fbx[0]", fx[0].vraag, vr("Automatische herstart", 6)); eq("fbx[1]", fx[1].vraag, vr("Ciprofloxacine-dosis (bronconflict)", 6));
eq("profiel Richtlijn refl.", ep.profielen[1].reflectievraag, vr("Profiel ciprofloxacine", 6));
eq("profiel Kweekgestuurd refl. = null", ep.profielen[0].reflectievraag, null);
// gebeurtenissen
const gl = lines.filter(l => /^\| [ABC] \|/.test(l)).map(cells);
for (const g of ep.gebeurtenissen) eq("gebeurtenis " + g.id + ".tekst", g.tekst, gl.filter(c => c[0] === g.id)[0][2]);
// zichtbaar
const zl = lines.filter(l => /^- Geen sick day|^- Ciprofloxacine zonder B4|^- I9 gemist/.test(l));
const zt = zl.map(l => l.match(/"([^"]+)"/)[1]);
eq("zicht[0]", ep.zichtbaarAlsOntbreekt[0].tekst, zt[0]); eq("zicht[1]", ep.zichtbaarAlsOntbreekt[1].tekst, zt[1]); eq("zicht[2]", ep.zichtbaarAlsOntbreekt[2].tekst, zt[2]);
// patientkaart
const pk = lines.slice(241, 248).join("\n");
eq("kop+klachten", ep.patient.zichtbaar.kop + " " + ep.patient.zichtbaar.klachten, lines.filter(l => /^- Mevrouw V., 79/.test(l))[0].replace(/^- /, ""));
eq("medicatieTekst", ep.patient.zichtbaar.medicatieTekst, lines.filter(l => /^- Medicatie: lisinopril, spiro/.test(l))[0].replace(/^- Medicatie: /, ""));
eq("casusMedicatieregel", ep.patient.casusMedicatieregel, "lisinopril, spironolacton (hypertensie), calcium/colecalciferol.");
const lab = lines.filter(l => /^- Lab: eGFR 28/.test(l))[0].replace(/^- Lab: /, "");
eq("labTekst+risico", ep.patient.zichtbaar.labTekst + " " + ep.patient.meta.risicogroep, lab);
const vb = lines.filter(l => /^- Verborgen achter G3/.test(l))[0].replace(/^- Verborgen achter G3: /, "");
eq("verborgen", ep.patient.verborgen[0].onthult + " " + ep.patient.verborgen[0].meta.toelichting, vb);
eq("toelichting spiro", ep.patient.meta.toelichting, lines.filter(l => /Wie spironolacton heeft gestart/.test(l))[0].replace(/^\s*- /, ""));
// knoppen
eq("knoppen", JSON.stringify(ep.knoppen.casusTekst), JSON.stringify(["volledig repertoire (26 kaarten)", "acties per beurt krap", "2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"]));
// score casusTekst
eq("score dur", "Duurzaamheid: " + ep.score.duurzaamheid.casusTekst, lines.filter(l => /^- Duurzaamheid: de-escaleren/.test(l))[0].replace(/^- /, ""));
eq("score doel", "Doelmatigheid: " + ep.score.doelmatigheid.casusTekst, lines.filter(l => /^- Doelmatigheid: G3 gebruiken/.test(l))[0].replace(/^- /, ""));
// profielen casusTekst
const pr = lines.filter(l => /^\| (Amoxicilline\/clavulaanzuur 875|Ciprofloxacine met calcium)/.test(l)).map(cells);
eq("profiel Kweekgestuurd casusTekst", ep.profielen[0].casusTekst, pr[0][2]); eq("profiel Richtlijn casusTekst", ep.profielen[1].casusTekst, pr[1][2]);
// bronconflict
eq("bronconflict", "voor " + "ciprofloxacine" , "voor ciprofloxacine");
const bc = lines.filter(l => /^Bronconflict, geen poort:/.test(l))[0].replace(/^Bronconflict, geen poort: /, "");
eq("bronconflict meta", fx[1].meta.toelichting, bc);
// statusTeksten
console.log("statusTeksten", JSON.stringify(ep.statusTeksten.af), JSON.stringify(ep.statusTeksten.aan), JSON.stringify(ep.statusTeksten.geenVerbetering48));
console.log("\n" + n + " vergelijkingen, " + bad + " afwijkingen");
