// Mutatietest van tests/data-e3.tests.js: verandert één ding in de E3-data en kijkt of de tests rood worden.
const fs = require("fs"), vm = require("vm");
const root = "/home/user/epic-green-cards/";
function draai(mut) {
  const sb = { console }; sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
  ["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js", "regels/predicaten.js", "tests/testlib.js"].forEach(f => vm.runInContext(fs.readFileSync(root + f, "utf8"), sb, { filename: f }));
  const c = sb.CASUSSEN[0], e = c.episodes.find(x => x.id === "E3");
  const inv = id => e.invarianten.find(i => i.id === id);
  mut(e, inv, c);
  vm.runInContext(fs.readFileSync(root + "tests/data-e3.tests.js", "utf8"), sb, { filename: "data-e3.tests.js" });
  const res = sb.Test.draaiAlles("data-e3");
  return res.filter(r => !r.ok).length;
}
const muts = {
  "ernst I9 3->2": (e, i) => { i("I9").ernst = 2; },
  "ernst I8 4->3": (e, i) => { i("I8").ernst = 3; },
  "geldtIn I10 -> *": (e, i) => { i("I10").geldtIn = ["*"]; },
  "geldtIn I15 uitdroging -> weefselinvasie": (e, i) => { i("I15").geldtIn = ["weefselinvasie"]; },
  "geldtIn I8 C -> *": (e, i) => { i("I8").geldtIn = ["*"]; },
  "I13 tot 0 -> 1": (e, i) => { i("I13").predicaat.args[2].arg.tot = 1; },
  "I14 tot 1 -> 2": (e, i) => { i("I14").predicaat.args[2].arg.args[0].tot = 2; },
  "I14 B3 doel calcium -> spironolacton": (e, i) => { i("I14").predicaat.args[2].arg.args[1].K.doel = "spironolacton"; },
  "I16 n 2 -> 3": (e, i) => { i("I16").predicaat.args[0].arg.n = 3; },
  "I15 n 2 -> 3": (e, i) => { i("I15").predicaat.arg.args[0].n = 3; },
  "I15 N3 -> N2": (e, i) => { i("I15").predicaat.arg.args[2].K.kaart = "N2"; },
  "I10 offset 0 -> 1": (e, i) => { i("I10").predicaat.op.offset = 1; },
  "I8 offset 1 -> 2": (e, i) => { i("I8").predicaat.args[1].op.offset = 2; },
  "I8 klachten op offset 0 -> 1": (e, i) => { i("I8").predicaat.args[2].args[0].op.offset = 1; i("I8").predicaat.args[2].args[1].op.offset = 1; },
  "I5 waarde 30 -> 25": (e, i) => { i("I5").predicaat.args[1].waarde = 25; },
  "I7 van 2 -> 3": (e, i) => { i("I7").predicaat.args[2].args[0].arg.van = 3; },
  "I7 O2 tot 4 -> 5": (e, i) => { i("I7").predicaat.args[2].args[0].arg.tot = 5; },
  "I9 en -> of (bouwopdracht-lezing)": (e, i) => { i("I9").predicaat.args[0].args.splice(2, 1); i("I9").predicaat.args[0].p = "of"; },
  "I9 Ev2 doel -> lisinopril": (e, i) => { i("I9").predicaat.args[0].args[2].K.doel = "lisinopril"; },
  "I9 voor -> na": (e, i) => { i("I9").predicaat.args[1].args[1].arg.args[1].p = "na"; },
  "I11 O1 naGebeurtenis weg": (e, i) => { delete i("I11").predicaat.args[1].arg.args[0].K.naGebeurtenis; },
  "I6 risicogroep -> false": (e, i) => { i("I6").predicaat.args[0].waarde = false; },
  "I4 n 1 -> 2": (e, i) => { i("I4").predicaat.n = 2; },
  "I12 V9 -> V8": (e, i) => { i("I12").predicaat.middel = "V8"; },
  "I1 kaart N1 -> N2": (e, i) => { i("I1").predicaat.K.kaart = "N2"; },
  "A trigger n 4 -> 5": (e) => { e.gebeurtenissen[0].trigger.n = 5; },
  "B trigger n 7 -> 6": (e) => { e.gebeurtenissen[1].trigger.n = 6; },
  "C n 3 -> 2": (e) => { e.gebeurtenissen[2].trigger.n = 2; },
  "A zet.statusNaBeurten weg": (e) => { delete e.gebeurtenissen[0].zet; },
  "A statusNaBeurten 2 -> 3": (e) => { e.gebeurtenissen[0].zet.statusNaBeurten = 3; },
  "C resistent + V3": (e) => { e.gebeurtenissen[2].zet.resistent.push("V3"); },
  "C gevoelig - V7": (e) => { e.gebeurtenissen[2].zet.gevoelig = ["V8", "V4", "V3"]; },
  "A groep weg": (e) => { delete e.gebeurtenissen[0].groep; },
  "A toestand": (e) => { e.gebeurtenissen[0].toestand = "uitdroging"; },
  "werkzaamheid cystitis + V8": (e) => { e.werkzaamheid.cystitis.werkzaam.push({ kaart: "V8" }); },
  "werkzaamheid weefselinvasie V4 werkzaam": (e) => { e.werkzaamheid.weefselinvasie.werkzaam.push({ kaart: "V4" }); },
  "V7 als-voorwaarde B4 -> B2": (e) => { e.werkzaamheid.weefselinvasie.werkzaam[2].als.args[0].K.kaart = "B2"; },
  "V7 als B3 doel": (e) => { e.werkzaamheid.weefselinvasie.werkzaam[2].als.args[1].K.doel = "lisinopril"; },
  "statusTeksten.aan": (e) => { e.statusTeksten.aan = "klachten nemen toe"; },
  "score dur V8 3 -> 2": (e) => { e.score.duurzaamheid.regels[0].punten = 2; },
  "score dur V7 -> 3": (e) => { e.score.duurzaamheid.regels[2].punten = 3; },
  "score doelm G3 voor -> na": (e) => { e.score.doelmatigheid.regels[0].als.args[1].dan.p = "na"; },
  "profiel volgorde omgedraaid": (e) => { e.profielen.reverse(); },
  "profiel Kweekgestuurd middel V8->V7": (e) => { e.profielen[0].als.middel = "V7"; },
  "reflectievraag cipro gewijzigd": (e) => { e.profielen[1].reflectievraag = e.profielen[1].reflectievraag.replace("Gold", "Gold toch"); },
  "feedbackExtra B5 trigger -> B3": (e) => { e.feedbackExtra[0].trigger.K.kaart = "B3"; },
  "feedbackExtra wanneer altijd": (e) => { e.feedbackExtra[0].wanneer = "altijd"; },
  "zichtbaar[0] N3 -> N2": (e) => { e.zichtbaarAlsOntbreekt[0].trigger.args[3].K.kaart = "N2"; },
  "zichtbaar[2] trigger ongelijk I9": (e) => { e.zichtbaarAlsOntbreekt[2].trigger = { p: "waarheid", waarde: true }; },
  "knoppen acties 3 -> 2": (e) => { e.knoppen.actiesPerBeurt = 2; },
  "knoppen dagen 7 -> 6": (e) => { e.knoppen.aantalDagen = 6; },
  "raadplegen kost 1 -> 0": (e) => { e.knoppen.raadplegenKost = 0; },
  "repertoire zonder V10": (e) => { e.repertoire.splice(e.repertoire.indexOf("V10"), 1); },
  "antibiotica zonder V10": (e) => { e.antibiotica.pop(); },
  "startToestanden": (e) => { e.startToestanden = ["weefselinvasie"]; },
  "patient.waar eGFR 29": (e) => { e.patient.waar.eGFR = 29; },
  "patient.waar risicogroep false": (e) => { e.patient.waar.risicogroep = false; },
  "zichtbaar eGFR 42": (e) => { e.patient.zichtbaar.lab.eGFR = 42; },
  "verborgen G3 -> G2": (e) => { e.patient.verborgen[0].kaart = "G2"; },
  "medicatie calcium weg": (e) => { e.patient.medicatie.pop(); },
  "afrondenPasNaGebeurtenissen toegevoegd": (e) => { e.afrondenPasNaGebeurtenissen = true; },
  "TODO weg uit casus.todoBart (E3-2)": (e, i, c) => { c.todoBart = c.todoBart.filter(t => t.id !== "TODO_BART-E3-2"); },
  "TODO E3-6 gekozenLezing leeg": (e, i, c) => { c.todoBart.find(t => t.id === "TODO_BART-E3-6").gekozenLezing = ""; },
  "vraag I10 spatie": (e, i) => { i("I10").vraag += " "; },
  "vraag I12 'eGFR van 28' -> 29": (e, i) => { i("I12").vraag = i("I12").vraag.replace("28", "29"); },
  "bron I14": (e, i) => { i("I14").bron = "Kompas"; },
  "I16 Ev3 -> Ev2": (e, i) => { i("I16").predicaat.args[1].args[1].K.kaart = "Ev2"; },
  "I16 geenVerbetering48 -> aan": (e, i) => { i("I16").predicaat.args[1].args[0].waarde = "aan"; },
  "I10 V4 weg uit middel": (e, i) => { i("I10").predicaat.middel = ["V3"]; },
};
let overleefd = 0;
for (const [naam, f] of Object.entries(muts)) {
  let n;
  try { n = draai(f); } catch (x) { n = "crash: " + x.message; }
  const gedood = typeof n === "string" || n > 0;
  if (!gedood) overleefd++;
  console.log((gedood ? "gedood   " : "OVERLEEFT ") + naam + (typeof n === "number" ? " (" + n + " rood)" : " " + n));
}
console.log("\novergeleefde mutaties:", overleefd, "van", Object.keys(muts).length);
