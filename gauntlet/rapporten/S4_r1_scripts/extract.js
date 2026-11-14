// Onafhankelijke letterlijkheidscontrole S4/E3: leest casus-uwi.md zelf, laadt de data, vergelijkt teken voor teken.
const fs = require("fs"), vm = require("vm");
const root = "/home/user/epic-green-cards/";
const md = fs.readFileSync(root + "casus-uwi.md", "utf8").split("\n");
const sb = { console }; sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js"].forEach(f => vm.runInContext(fs.readFileSync(root + f, "utf8"), sb, { filename: f }));
const casus = sb.CASUSSEN[0], e3 = casus.episodes.find(e => e.id === "E3");
const strip = s => s.replace(/\*\*/g, "").trim();
const secStart = h => md.findIndex(l => l.startsWith(h));
const s4 = secStart("## 4."), s5 = secStart("## 5."), s6 = secStart("## 6."), s7 = secStart("## 7.");
const sec = (a, b) => md.slice(a, b);
function rows(lines, headerRegex) { // tabel direct na kop-regel die headerRegex matcht
  const i = lines.findIndex(l => headerRegex.test(l)); if (i < 0) throw new Error("tabel niet gevonden " + headerRegex);
  const out = []; for (let j = i + 2; j < lines.length && lines[j].startsWith("|"); j++) out.push(lines[j].replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
  return out;
}
let fouten = 0, ok = 0;
function eq(naam, bron, spel) { if (bron === spel) ok++; else { fouten++; console.log("AFWIJKING " + naam + "\n  bron: " + JSON.stringify(bron) + "\n  spel: " + JSON.stringify(spel)); } }
const E3 = sec(s6, s7), E2 = sec(s5, s6), E1 = sec(s4, s5);
// patiëntkaart
const pk = E3.slice(E3.findIndex(l => l.startsWith("### Patiëntkaart")), E3.findIndex(l => l.startsWith("### Repertoire")));
console.log(pk.join("\n"));
const kopRegel = strip(pk.find(l => l.startsWith("- **Mevrouw")).slice(2));
console.log("kopregel:", kopRegel);
eq("kop", "Mevrouw V., 79 jaar (1 jaar na episode 2).", e3.patient.zichtbaar.kop);
eq("klachten", "Cystitis, geen koorts.", e3.patient.zichtbaar.klachten);
// gebeurtenissen
const geb = rows(E3, /^\| Id \| Trigger \| Inhoud/);
geb.forEach(r => { const id = r[0]; const g = e3.gebeurtenissen.find(x => x.id === id); eq("gebeurtenis " + id, strip(r[2]), g && g.tekst); });
// invarianten E3
const inv = rows(E3, /^\| Id \| Altijd fout \| Geldt in/);
inv.forEach(r => { const i = e3.invarianten.find(x => x.id === r[0]); if (!i) { fouten++; console.log("ontbreekt", r[0]); return; }
  eq(r[0] + " altijdFout", strip(r[1]), i.altijdFout); eq(r[0] + " geldtInTekst", strip(r[2]), i.geldtInTekst); eq(r[0] + " bron", strip(r[3]), i.bron); });
const inv5 = rows(E2, /^\| Id \| Altijd fout \| Bron/);
inv5.forEach(r => { const i = e3.invarianten.find(x => x.id === r[0]); eq(r[0] + " altijdFout", strip(r[1]), i.altijdFout); eq(r[0] + " bron", strip(r[2]), i.bron); });
const inv4 = rows(E1, /^\| Id \| Altijd fout \| Bron/);
inv4.filter(r => r[0] !== "I3").forEach(r => { const i = e3.invarianten.find(x => x.id === r[0]); eq(r[0] + " altijdFout", strip(r[1]), i.altijdFout); eq(r[0] + " bron", strip(r[2]), i.bron); });
// feedback
const fb6 = rows(E3, /^\| Trigger \| Vraag/), fb5 = rows(E2, /^\| Trigger \| Vraag/), fb4 = rows(E1, /^\| Trigger \| Vraag/);
const q = s => s.replace(/^"|"$/g, "");
const F = {}; [fb4, fb5, fb6].forEach(t => t.forEach(r => { F[r[0]] = q(r[1]); }));
console.log("feedback-triggers:", Object.keys(F).join(" | "));
["I1", "I4"].forEach(id => eq(id + " vraag", F[id], e3.invarianten.find(x => x.id === id).vraag));
["I5", "I8"].forEach(id => eq(id + " vraag", F[id], e3.invarianten.find(x => x.id === id).vraag));
["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"].forEach(id => eq(id + " vraag", F[id], e3.invarianten.find(x => x.id === id).vraag));
const I6 = e3.invarianten.find(x => x.id === "I6"), I7 = e3.invarianten.find(x => x.id === "I7");
eq("I6 vraag", F["I6, geen kweek"], I6.vraag); eq("I6 var0", F["I6, geen kweek"], I6.vraagVarianten[0].vraag); eq("I6 var1", F["I6, afwachten"], I6.vraagVarianten[1].vraag);
eq("I7 vraag", F["I7, geen kalium"], I7.vraag); eq("I7 var0", F["I7, geen kalium"], I7.vraagVarianten[0].vraag); eq("I7 var1", F["I7, niet gehalveerd"], I7.vraagVarianten[1].vraag);
eq("Automatische herstart", F["Automatische herstart"], e3.feedbackExtra[0].vraag);
eq("Cipro-dosis", F["Ciprofloxacine-dosis (bronconflict)"], e3.feedbackExtra[1].vraag);
eq("Profiel cipro", F["Profiel ciprofloxacine"], e3.profielen[1].reflectievraag);
// zichtbaar-als-ontbreekt
const zi = E3.slice(E3.findIndex(l => l.startsWith("### Wat er zichtbaar")), E3.findIndex(l => l.startsWith("### Feedback")));
console.log(zi.join("\n"));
const m1 = zi.filter(l => l.startsWith("- "));
const z0 = strip(m1[0]), z1 = strip(m1[1]), z2 = strip(m1[2]);
eq("zichtbaar0 tekst", z0.match(/"([^"]*)"/)[1], e3.zichtbaarAlsOntbreekt[0].tekst);
eq("zichtbaar0 toelichting", z0.split("\" ")[1].trim(), e3.zichtbaarAlsOntbreekt[0].toelichting);
eq("zichtbaar1", z1.match(/"([^"]*)"/)[1], e3.zichtbaarAlsOntbreekt[1].tekst);
eq("zichtbaar2", z2.match(/"([^"]*)"/)[1], e3.zichtbaarAlsOntbreekt[2].tekst);
// bronconflict
const bc = E3.find(l => l.startsWith("**Bronconflict"));
eq("bronconflict", strip(bc).replace(/^Bronconflict, geen poort: /, ""), e3.feedbackExtra[1].toelichting.replace(/^v/, "v"));
// knoppen
const kn = E3.slice(E3.findIndex(l => l.startsWith("**Knoppen")) + 1, E3.findIndex(l => l.startsWith("### Patiëntkaart"))).filter(l => l.startsWith("- ")).map(l => l.slice(2));
eq("knoppen casusTekst", JSON.stringify(kn), JSON.stringify(e3.knoppen.casusTekst));
// medicatie
console.log("medicatieregel casus:", pk.filter(l => /Medicatie/.test(l)).join(" // "));
eq("casusMedicatieregel", "lisinopril, spironolacton (hypertensie), calcium/colecalciferol", e3.patient.casusMedicatieregel);
const lab = pk.find(l => l.includes("**Lab:**")); console.log("lab:", strip(lab));
eq("labTekst", "eGFR 28, recent.", e3.patient.zichtbaar.labTekst);
eq("risicogroep", "Risicogroep [NHG].", e3.patient.zichtbaar.risicogroep);
const toel = pk.find(l => l.includes("Wie spironolacton")); eq("toelichting", strip(toel).replace(/^- /, ""), e3.patient.toelichting);
const verb = pk.find(l => l.includes("Verborgen achter G3")); console.log("verborgen:", strip(verb));
// statusTeksten / profielen
const prof = E3.filter(l => l.startsWith("| Amoxicilline/clavulaanzuur 875") || l.startsWith("| Ciprofloxacine met calcium"));
prof.forEach(l => console.log("profielrij:", l));
eq("kweekgestuurd casusTekst", strip(prof[0].split("|")[4]).trim(), e3.profielen[0].casusTekst);
eq("richtlijn casusTekst", strip(prof[1].split("|")[4]).trim(), e3.profielen[1].casusTekst);
// kaartbibliotheek: kaartnamen in repertoire = alle
const lib = rows(md, /^\| Id \| Categorie \| Label/).map(r => r[0]);
eq("repertoire = bibliotheek", lib.join(","), e3.repertoire.join(","));
console.log("bibliotheek-volgorde:", lib.join(","));
// alle strings met ** of NBSP
let gev = 0; (function w(x, p) { if (typeof x === "string") { if (/\*\*| | /.test(x)) { gev++; console.log("rare tekens in", p); } } else if (x && typeof x === "object") Object.keys(x).forEach(k => w(x[k], p + "." + k)); })(e3, "E3");
console.log("\nok:", ok, "afwijkingen:", fouten, "rare tekens:", gev);
