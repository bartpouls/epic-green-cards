// Eigen routes van de criticus (dag-voor-dag plannen, eigen verwachtingen uit casus-uwi.md).
const { laad, casusVragen } = require("./laad.js");
const opts = {}; if (process.env.MUT) Object.assign(opts, require(process.env.MUT));
laad(opts);
const Q = casusVragen();
const q = (s, k) => { const v = Q[s + ":" + k]; if (!v) throw new Error("casusvraag ontbreekt " + s + ":" + k); return v; };
const V = {
  I1: q(4, "I1"), I3: q(4, "I3"), I4: q(4, "I4"), I5: q(5, "I5"), I6k: q(5, "I6, geen kweek"), I6a: q(5, "I6, afwachten"),
  I7k: q(5, "I7, geen kalium"), I7h: q(5, "I7, niet gehalveerd"), I8: q(5, "I8"), I9: q(6, "I9"), I10: q(6, "I10"), I11: q(6, "I11"),
  I12: q(6, "I12"), I13: q(6, "I13"), I14: q(6, "I14"), I15: q(6, "I15"), I16: q(6, "I16"),
};
const X = { O1: q(4, "O1 gespeeld"), eGFR: q(5, "Verouderde eGFR niet opgemerkt"), gew: q(5, "Onnodig gewisseld"), herstart: q(6, "Automatische herstart"), cipro: q(6, "Ciprofloxacine-dosis (bronconflict)") };
const R = { terug: q(4, "Profiel terughoudend"), direct: q(4, "Profiel direct behandelen"), cipro: q(6, "Profiel ciprofloxacine") };
const Z = { N1: q(4, "zicht:Zonder N1"), V1: q(4, "zicht:V1 zonder Ev1"), V3: q(5, "zicht:Nitrofurantoïne zonder G2"), V5: q(5, "zicht:V5 zonder O2"), cipro: q(6, "zicht:Ciprofloxacine zonder B4/B3"), I9: q(6, "zicht:I9 gemist"), sick: "De nierfunctie daalt verder en het kalium stijgt." };
const W = "V6::V8::875/125 mg 2 dd";
const P = s => { const d = s.split("::"); return { k: d[0], doel: d[1] || null, optie: d[2] || null }; };

function speel(ep, plan, rng, opt) {
  const casus = CASUSSEN[0];
  const st = Engine.nieuwSpel(casus, ep, { rng: () => rng });
  const log = [];
  plan.forEach((dag, i) => {
    dag.forEach(c => { const x = P(c); const r = Engine.speelKaart(st, x.k, { doel: x.doel, optie: x.optie }); if (!r.ok) throw new Error("dag " + (i + 1) + " kaart " + c + ": " + r.fout); });
    if (i < plan.length - 1 || (opt && opt.tot7)) { if (i < plan.length - 1) Engine.volgendeDag(st); }
  });
  if (opt && opt.tot7) while (st.dag < st.aantalDagen) Engine.volgendeDag(st);
  return { st, u: Engine.rondAf(st) };
}
// hulp: wijzig plan (kopie)
const kop = p => JSON.parse(JSON.stringify(p));
const sub = (p, oud, nieuw) => { const q = kop(p); for (const d of q) { const i = d.indexOf(oud); if (i >= 0) { if (nieuw === null) d.splice(i, 1); else d[i] = nieuw; return q; } } throw new Error("sub: " + oud + " niet gevonden"); };
const ins = (p, dag, c) => { const q = kop(p); while (q.length < dag) q.push([]); q[dag - 1].push(c); return q; };

const AB = [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V8", W], ["Ev1", "B3::spironolacton", "V6::lisinopril::halveren"], ["N3"], [], []];
const BA = [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W], ["Ev1", "Ev2::spironolacton"], []];

const routes = [];
const r1 = (id, ep, plan, v, extra) => routes.push(Object.assign({ id, ep, plannen: { "A,B": plan, "B,A": plan }, v }, extra || {}));
const r3 = (id, ab, ba, v, extra) => routes.push(Object.assign({ id, ep: "E3", plannen: { "A,B": ab, "B,A": ba }, v }, extra || {}));
const gh = (profiel, refl, dz, dm, extra, zicht) => ({ ok: true, profiel, refl, dz, dm, extra: extra || [], zicht: zicht || [] });
const ft = (ids, vraag, zicht) => ({ ok: false, ids, vraag, zicht: zicht || [] });

// ---------------- E1 ----------------
r1("E1-01 afwachten", "E1", [["V1", "N1", "Ev1"]], gh("Terughoudend", R.terug, 3, 3));
r1("E1-02 afwachten verspreid over dagen", "E1", [["Ev1"], ["N1"], ["V1"]], gh("Terughoudend", R.terug, 3, 3));
r1("E1-03 uitgesteld recept", "E1", [["V2", "N1", "N2::V4"], ["Ev1"]].map(d => d.filter(c => !c.startsWith("N2"))), gh("Gedeelde regie", null, 2, 3));
r1("E1-04 uitgesteld recept met middel", "E1", [["V2", "V3", "N1"], ["N2::V3", "Ev1"]], gh("Gedeelde regie", null, 2, 3));
r1("E1-05 nitrofurantoine", "E1", [["V3", "N1"]], gh("Direct behandelen", R.direct, 1, 3));
r1("E1-06 nitrofurantoine met N2, Ev1", "E1", [["V3", "N1", "N2::V3"], ["Ev1"]], gh("Direct behandelen", R.direct, 1, 3));
r1("E1-07 fosfomycine", "E1", [["V4", "N1", "N2::V4"]], gh("Direct behandelen", R.direct, 1, 3));
r1("E1-08 trimethoprim", "E1", [["N1", "V5"]], gh("Direct behandelen", R.direct, 1, 3));
r1("E1-09 afwachten + O1 (dm 2, extra)", "E1", [["V1", "N1", "Ev1"], ["O1"]], gh("Terughoudend", R.terug, 3, 2, [X.O1]));
r1("E1-10 nitro + O1 + O2 (dm 1)", "E1", [["V3", "N1", "O1"], ["O2"]], gh("Direct behandelen", R.direct, 1, 1, [X.O1]));
r1("E1-11 fosfomycine + G1 + G2 (gratis)", "E1", [["V4", "N1", "N2::V4"], ["G1", "G2"]], gh("Direct behandelen", R.direct, 1, 3));
r1("E1-12 V1+V2 samen", "E1", [["V1", "V2", "N1"], ["Ev1"]], gh("Gedeelde regie", null, 2, 3));
r1("E1-F1 zonder N1", "E1", [["V3"]], ft(["I1"], V.I1, [Z.N1]));
r1("E1-F3 afwachten zonder Ev1", "E1", [["V1", "N1"]], ft(["I3"], V.I3, [Z.V1]));
r1("E1-F4 twee antibiotica", "E1", [["V3", "V4", "N1"]], ft(["I4"], V.I4));
r1("E1-F4b twee antibiotica op verschillende dagen", "E1", [["V5", "N1"], ["V3"]], ft(["I4"], V.I4));
r1("E1-F13 I1+I3 (gelijke ernst: I1 eerst)", "E1", [["V1"]], ft(["I1", "I3"], V.I1, [Z.N1, Z.V1]));
r1("E1-F14 I3+I4 (I3 eerst)", "E1", [["V1", "V3", "V4"], ["N1"]], ft(["I3", "I4"], V.I3, [Z.V1]));
r1("E1-F15 lege route", "E1", [[]], ft(["I1"], V.I1, [Z.N1]));
// ---------------- E2 ----------------
r1("E2-01 fosfomycine, niet wisselen", "E2", [["G2", "O1", "V4"], ["N1", "N2::V4"], [], [], [], [], []], gh("Kweekgestuurd, smal", null, 3, 3));
r1("E2-02 trimethoprim 7d + O2 + V6 + B1 (B1 op d3)", "E2", [["G2", "O1", "V5"], ["O2", "N1"], ["B1::V4"], ["V6::V5::halveren"], [], [], []], gh("Bijgestuurd", null, 3, 3));
r1("E2-03 trimethoprim, V6 voor B1 op d4", "E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6::V5::halveren", "B1::V4"], [], [], []], gh("Bijgestuurd", null, 3, 3));
r1("E2-04 fosfomycine, G2 te laat", "E2", [["O1", "V4", "N1"], ["G2"], [], [], [], [], []], gh("Kweekgestuurd, smal", null, 3, 2, [X.eGFR]));
r1("E2-05 onnodig wisselen V4>V5>V4", "E2", [["G2", "O1", "V4"], ["N1", "B1::V5"], ["B1::V4", "O2"], [], ["V6::V5::halveren"], [], []], { ok: true, dz: 2, dm: 3, extra: [X.gew], zicht: [] });
r1("E2-F1 zonder N1", "E2", [["G2", "O1", "V4"], [], [], []], ft(["I1"], V.I1));
r1("E2-F4 twee antibiotica (V4+V5 met O2 en V6)", "E2", [["G2", "O1", "V4"], ["N1", "V5"], ["O2"], [], ["V6::V5::halveren"], [], []], ft(["I4"], V.I4));
r1("E2-F5 nitrofurantoine met G2", "E2", [["G2", "O1", "V3"], ["N1"], [], []], ft(["I5"], V.I5));
r1("E2-F5b nitrofurantoine zonder G2 (zichtbaar)", "E2", [["O1", "V3", "N1"], [], []], ft(["I5"], V.I5, [Z.V3]));
r1("E2-F6a antibioticum zonder O1", "E2", [["G2", "V4", "N1"], [], []], ft(["I6"], V.I6k));
r1("E2-F6b afwachten", "E2", [["G2", "V1", "N1"], ["Ev1"], []], ft(["I6"], V.I6a));
r1("E2-F6c niets voorschrijven (strengste lezing)", "E2", [["G2", "O1", "N1"], [], []], ft(["I6"], V.I6a));
r1("E2-F7a trimethoprim zonder O2", "E2", [["G2", "O1", "V5"], ["N1"], ["B1::V4"], ["V6::V5::halveren"], [], []], ft(["I7"], V.I7k, [Z.V5]));
r1("E2-F7b trimethoprim zonder V6", "E2", [["G2", "O1", "V5"], ["O2", "N1"], ["B1::V4"], [], [], []], ft(["I7"], V.I7h));
r1("E2-F7c V6 te vroeg (d3 = verschil 2)", "E2", [["G2", "O1", "V5"], ["O2", "N1"], ["V6::V5::halveren", "B1::V4"], [], []], ft(["I7"], V.I7h));
r1("E2-F7d O2 te laat (d5 = verschil 4)", "E2", [["G2", "O1", "V5"], ["N1"], ["B1::V4"], ["V6::V5::halveren"], ["O2"], [], []], ft(["I7"], V.I7k, [Z.V5].filter(() => false)));
r1("E2-F8 resistent middel blijft doorlopen", "E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6::V5::halveren"], [], [], []], ft(["I8"], V.I8));
r1("E2-F8b wissel pas na 2 dagen (buiten 2 beurten)", "E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6::V5::halveren"], [], ["B1::V4"], []], ft(["I8"], V.I8));
r1("E2-F8c I8 kun je niet ontlopen door een wissel naar een ander resistent middel: alleen op dag C+1 (V5 > V5 niet mogelijk) - sla over", "E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6::V5::halveren"], [], [], []], ft(["I8"], V.I8));
r1("E2-F7_6 I7 gaat voor I6", "E2", [["G2", "V5", "O1"], ["N1"], ["B1::V4"], [], []], ft(["I7", "I6"], V.I7k, [Z.V5]));
r1("E2-F5_1 I5 gaat voor I1", "E2", [["G2", "O1", "V3"], [], []], ft(["I5", "I1"], V.I5));
r1("E2-F15 lege route", "E2", [[]], ft(["I6", "I1"], V.I6a));
// ---------------- E3 geldig ----------------
r3("E3-01 start fosfomycine G3>O1>V4+N1 (+O2+Ev2), afgerond zonder gebeurtenis", [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"]], [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"]], { ok: true, profiel: null, dz: null, dm: 3, extra: [], zicht: [] });
r3("E3-02 amox/clav 875/125 + sick-day-set", AB, BA, gh("Kweekgestuurd", null, 3, 3));
{
  const abc = [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V7", "B4::V7"], ["Ev1", "B3::spironolacton", "V6::lisinopril::halveren"], ["N3"], [], []];
  const bac = [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["O1", "B1::V7", "B4::V7"], ["Ev1", "Ev2::spironolacton"], []];
  r3("E3-03 ciprofloxacine + B4", abc, bac, gh("Richtlijn eerste keus", R.cipro, 2, 3, [X.cipro]));
  r3("E3-04 ciprofloxacine + B3 calcium", sub(abc, "B4::V7", "B3::calcium"), sub(bac, "B4::V7", "B3::calcium"), gh("Richtlijn eerste keus", R.cipro, 2, 3, [X.cipro]));
  r3("E3-05 cipro: B4 de volgende dag (nog toegestaan)", [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V7", "G1"], ["Ev1", "B3::spironolacton", "B4::V7"], ["V6::lisinopril::halveren", "N3"], [], []], [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["O1", "B1::V7", "G1"], ["Ev1", "B4::V7", "Ev2::spironolacton"], []], gh("Richtlijn eerste keus", R.cipro, 2, 3, [X.cipro]));
}
{
  const ab = [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V7", "B4::V7"], ["Ev1", "B1::V8", W], ["B3::spironolacton", "V6::lisinopril::halveren", "N3"], [], []];
  const ba = [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["O1", "B1::V7", "B4::V7"], ["Ev1", "B1::V8", W, ], ["Ev2::spironolacton"]];
  r3("E3-06 de-escalatie cipro > amox/clav na C", ab, ba, { ok: true, dz: 3, dm: 3, extra: [X.cipro], zicht: [] });
}
r3("E3-07 sick-day-set in andere volgorde", [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V8", W], ["Ev1", "V6::lisinopril::halveren", "B3::spironolacton"], ["N3"], [], []], [["G3", "O1", "V4"], ["N1"], ["V6::lisinopril::halveren", "B3::spironolacton"], ["Ev1", "N3", "O2"], ["O1", "B1::V8", W], ["Ev1", "Ev2::spironolacton"], []], gh("Kweekgestuurd", null, 3, 3));
r3("E3-08 hervatten na overleg (B5 na Ev2)", AB.map((d, i) => i === 4 ? ["N3", "B5::spironolacton"] : d), BA.map((d, i) => i === 5 ? ["Ev1", "Ev2::spironolacton", "B5::spironolacton"] : d), gh("Kweekgestuurd", null, 3, 3, [X.herstart]));
r3("E3-09 verwijzen na 48 uur zonder verbetering", [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["B2::V4", "Ev1", "G1"], ["B3::spironolacton", "V6::lisinopril::halveren", "N3"], ["Ev1", "Ev3"], [], []], [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["B2::V4", "Ev1", "Ev2::spironolacton"], ["Ev3"], [], []], { ok: true, profiel: null, dz: null, dm: 3, extra: [], zicht: [] });
r3("E3-10 G3 te laat: dm 2", [["O1", "V4", "G3"]].concat(AB.slice(1)), [["O1", "V4", "G3"]].concat(BA.slice(1)), gh("Kweekgestuurd", null, 3, 2));
function draai(lijst) {
  let rood = 0, n = 0;
  lijst.filter(r => !r.skip).forEach(r => {
    ["A,B", "B,A"].forEach((sleutel, i) => {
      if (r.ep !== "E3" && i === 1) return;
      n++;
      let res;
      try { res = speel(r.ep, r.plannen[sleutel], i === 0 ? 0 : 0.99, r.opt); } catch (e) { rood++; console.log("FOUT-SPEEL", r.id, sleutel, e.message); return; }
      const { u, st } = res, v = (r.vp && r.vp[sleutel]) || r.v, f = [];
      if (r.ep === "E3" && st.volgordeAB.join(",") !== sleutel) f.push("volgordeAB " + st.volgordeAB);
      if (u.poortGehaald !== v.ok) f.push("poort " + u.poortGehaald);
      if (v.ok) {
        if (u.geschonden.length) f.push("geschonden " + JSON.stringify(u.geschonden.map(x => x.id)));
        if (u.vraag !== null) f.push("vraag niet null");
        if (!u.score) f.push("score null"); else {
          if (u.score.duurzaamheid !== v.dz) f.push("dz " + u.score.duurzaamheid + " verwacht " + v.dz);
          if (u.score.doelmatigheid !== v.dm) f.push("dm " + u.score.doelmatigheid + " verwacht " + v.dm);
        }
        if ("profiel" in v) { const pn = u.profiel && u.profiel.naam; if (pn !== v.profiel) f.push("profiel " + pn + " verwacht " + v.profiel); }
        if ("refl" in v && u.profiel && u.profiel.reflectievraag !== v.refl) f.push("refl " + JSON.stringify(u.profiel.reflectievraag));
        if (JSON.stringify(u.extraVragen.map(x => x.vraag)) !== JSON.stringify(v.extra)) f.push("extra " + JSON.stringify(u.extraVragen.map(x => x.vraag)));
      } else {
        const ids = u.geschonden.map(x => x.id);
        if (JSON.stringify(ids) !== JSON.stringify(v.ids)) f.push("geschonden " + JSON.stringify(ids) + " verwacht " + JSON.stringify(v.ids));
        if (u.vraag !== v.vraag) f.push("vraag " + u.vraag);
        if (u.score !== null) f.push("score niet null");
        if (u.profiel !== null) f.push("profiel niet null");
        if (u.extraVragen.some(x => x.wanneer === "alleenBijGehaaldePoort")) f.push("extra bij schending");
      }
      if (JSON.stringify(u.zichtbaar.map(x => x.tekst)) !== JSON.stringify(v.zicht)) f.push("zichtbaar " + JSON.stringify(u.zichtbaar.map(x => x.tekst)) + " verwacht " + JSON.stringify(v.zicht));
      if (f.length) { rood++; console.log("ROOD", r.id, "(" + sleutel + ")", f.join(" | ")); }
    });
  });
  return { n, rood };
}
module.exports = { routes, speel, V, X, R, Z, W, AB, BA, kop, sub, ins, P, ft, gh, r1, r3, draai };
if (require.main === module) { const r = draai(routes); console.log(r.n + " runs, " + r.rood + " rood"); }
