const { laad } = require("./laad.js"); laad();
const M = require("./mijn_routes.js");
const base = CASUSSEN[0];
const kop = x => JSON.parse(JSON.stringify(x));
function staat(ep, plan) { return M.speel(ep, plan, 0).st; }
const st3 = staat("E3", M.AB), st1 = staat("E1", [["V1", "N1", "Ev1"]]), st1f = staat("E1", [["V3"]]), st2 = staat("E2", [["G2", "O1", "V4"], ["N1"], [], [], []]);
const cases = [];
function c(naam, ep, st, fn, verwachtFout) { cases.push({ naam, ep, st, fn, verwachtFout }); }
const BAD = { p: "bestaatniet" };
c("onbekend predicaat in invariant (niet geldend)", "E3", st3, cs => { cs.episodes[2].invarianten.find(i => i.id === "I14").predicaat = BAD; }, true);
c("onbekend predicaat in invariant (geldig, waar)", "E1", st1f, cs => { cs.episodes[0].invarianten[0].predicaat = BAD; }, true);
c("predicaat ontbreekt in invariant", "E1", st1, cs => { delete cs.episodes[0].invarianten[1].predicaat; }, true);
c("kapotte vraagVariant 'als' in niet-geschonden invariant", "E3", st3, cs => { cs.episodes[2].invarianten.find(i => i.id === "I6").vraagVarianten[1].als = BAD; }, true);
c("kapotte scoreregel NA de matchende punten-regel", "E1", st1, cs => { cs.episodes[0].score.duurzaamheid.regels[2].als = BAD; }, true);
c("kapot profiel NA het matchende profiel", "E1", st1, cs => { cs.episodes[0].profielen[2].als = BAD; }, true);
c("kapotte feedbackExtra trigger bij 'alleenBijGehaaldePoort' en schending", "E1", st1f, cs => { cs.episodes[0].feedbackExtra[0].trigger = BAD; }, true);
c("kapotte zichtbaar-trigger", "E1", st1, cs => { cs.episodes[0].zichtbaarAlsOntbreekt[1].trigger = BAD; }, true);
c("kapotte teller (onbekende t) in perKeer", "E2", st2, cs => { cs.episodes[1].score.duurzaamheid.regels[0].perKeer = { t: "bestaatniet", kaart: "B1" }; }, true);
c("kapot werkzaamheid-predicaat", "E3", st3, cs => { cs.episodes[2].werkzaamheid.weefselinvasie.werkzaam[2].als = BAD; }, true);
c("kapot vereist-predicaat bij doel", "E3", st3, cs => { cs.kaarten.find(k => k.id === "B3").doelen.E3[0].vereist = BAD; }, true);
c("ernst is tekst", "E1", st1, cs => { cs.episodes[0].invarianten[0].ernst = "1"; }, true);
c("geldtIn leeg", "E1", st1, cs => { cs.episodes[0].invarianten[0].geldtIn = []; }, true);
c("geldtIn onbekende toestand", "E3", st3, cs => { cs.episodes[2].invarianten[0].geldtIn = ["bestaatniet"]; }, true);
c("typfout in veldnaam predicaat", "E1", st1f, cs => { cs.episodes[0].invarianten[2].predicaat = { p: "aantalActieveAntibiotica", op: ">", m: 1 }; }, true);
c("onbekende kaart in predicaat", "E1", st1, cs => { cs.episodes[0].invarianten[1].predicaat = { p: "gespeeld", kaart: 7 }; }, true);
c("wanneer ongeldig", "E1", st1, cs => { cs.episodes[0].feedbackExtra[0].wanneer = "soms"; }, true);
c("downside geen tekst/object", "E1", st1, cs => { cs.kaarten.find(k => k.id === "V1").downside = 5; }, true);
c("onbekende episode", "E9", st1, () => {}, true);
c("geen state", "E1", null, () => {}, true);
c("controle: ongeschonden casus werkt", "E1", st1, () => {}, false);
let slecht = 0;
for (const k of cases) {
  const cs = kop(base); k.fn(cs);
  let fout = null, res = null;
  try { res = Evaluatie.beoordeel(cs, k.ep, k.st); } catch (e) { fout = e.message; }
  const ok = k.verwachtFout ? fout !== null : fout === null;
  if (!ok) slecht++;
  console.log((ok ? "OK   " : "FOUT ") + k.naam + (fout ? " -> " + fout.slice(0, 140) : res ? " -> geen fout (poort " + res.poortGehaald + ")" : ""));
}
console.log("slecht:", slecht);
