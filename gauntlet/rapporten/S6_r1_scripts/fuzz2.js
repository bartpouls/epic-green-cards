// Gestuurde fuzz: start van geldige basisroutes (eigen plannen), pas 1-4 willekeurige wijzigingen toe, speel via Engine, vergelijk met oracle.
const { laad } = require("./laad.js");
const { oracle, scoreProfiel, ERNST } = require("./oracle.js");
const opts = {}; if (process.env.MUT) Object.assign(opts, require(process.env.MUT));
laad(opts);
const casus = CASUSSEN[0];
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const P = s => { const d = s.split("::"); return { k: d[0], doel: d[1] || null, optie: d[2] || null }; };
const W875 = "V6::V8::875/125 mg 2 dd";
const BASIS = {
  E1: [["V4", "N1", "N2::V4"], ["Ev1"], ["O2"]],
  E2: [["G2", "O1", "V4"], ["N1", "N2::V4"], ["B1::V5"], ["O2", "B1::V4"], ["V6::V5::halveren"], [], []],
  E3AB: [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V8", W875], ["Ev1", "B3::spironolacton", "V6::lisinopril::halveren"], ["N3"], [], []],
  E3BA: [["G3", "O1", "V4"], ["N1"], ["B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W875], ["Ev1", "Ev2::spironolacton"], []],
  E3CIP: [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V7", "B4::V7"], ["Ev1", "B3::spironolacton", "V6::lisinopril::halveren"], ["N3", "B1::V8", W875], [], []],
  E3CIPB3: [["G3", "O1", "V4"], ["N1", "O2", "Ev2::spironolacton"], ["O1", "B1::V7", "B3::calcium"], ["Ev1", "B3::spironolacton", "V6::lisinopril::halveren"], ["N3"], [], []],
  E2TMP: [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6::V5::halveren", "B1::V4"], [], [], []],
  E3TMP: [["G3", "O1", "V5"], ["N1", "O2", "Ev2::spironolacton"], ["Ev1"], ["B3::spironolacton", "V6::lisinopril::halveren", "V6::V5::halveren"], ["N3", "Ev1", "Ev3"], [], []],
};
const ALLE = {
  E1: ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2::V4", "N2::V3", "Ev1"],
  E2: ["G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2::V4", "Ev1", "B1::V3", "B1::V4", "B1::V5", "B2::V4", "B2::V5", "V6::V5::halveren", "V6::V5::verdubbelen", "V6::lisinopril::halveren"],
  E3: ["G1", "G3", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "V7", "V8", "V9", "V10", "N1", "N3", "Ev1", "Ev3", "Ev2::spironolacton", "Ev2::lisinopril", "B1::V3", "B1::V4", "B1::V7", "B1::V8", "B1::V9", "B1::V10", "B2::V4", "B2::V7", "B2::V8", "B3::spironolacton", "B3::calcium", "B3::lisinopril", "B5::spironolacton", "B5::calcium", "B4::V7",
    "V6::lisinopril::halveren", "V6::lisinopril::stoppen", W875, "V6::V8::500/125 mg 2 dd", "V6::V5::halveren", "V6::V7::halveren"],
};
const ep = process.argv[2], N = +process.argv[3] || 1000, seed0 = +process.argv[4] || 1;
const kies = (R, a) => a[Math.floor(R() * a.length)];
let fouten = 0, gehaald = 0, voorb = [], enkel = {}, ongeldigSpeel = 0, totaal = 0, speelOk = 0;
const epd = casus.episodes.find(e => e.id === ep);
const dataOrde = epd.invarianten.map(i => i.id);
for (let n = 0; n < N; n++) {
  const R = mulberry(seed0 * 7919 + n);
  const kandidaten = ep === "E1" ? [BASIS.E1] : ep === "E2" ? [BASIS.E2, BASIS.E2TMP] : [BASIS.E3AB, BASIS.E3BA, BASIS.E3CIP, BASIS.E3CIPB3, BASIS.E3TMP];
  let plan = JSON.parse(JSON.stringify(kies(R, kandidaten)));
  const k = 1 + Math.floor(R() * 4);
  for (let m = 0; m < k; m++) {
    const t = R();
    const dag = Math.floor(R() * plan.length);
    if (t < 0.3 && plan[dag].length) plan[dag].splice(Math.floor(R() * plan[dag].length), 1);
    else if (t < 0.55) plan[dag].splice(Math.floor(R() * (plan[dag].length + 1)), 0, kies(R, ALLE[ep]));
    else if (t < 0.75 && plan[dag].length) plan[dag][Math.floor(R() * plan[dag].length)] = kies(R, ALLE[ep]);
    else if (t < 0.9 && plan[dag].length) { const c = plan[dag].splice(Math.floor(R() * plan[dag].length), 1)[0]; plan[Math.floor(R() * plan.length)].push(c); }
    else { const d2 = Math.floor(R() * plan.length); const tmp = plan[dag]; plan[dag] = plan[d2]; plan[d2] = tmp; }
  }
  const rng = R() < 0.5 ? 0 : 0.99;
  const st = Engine.nieuwSpel(casus, ep, { rng: () => rng });
  let afrondDag = plan.length; if (R() < 0.15) afrondDag = 1 + Math.floor(R() * plan.length);
  for (let d = 0; d < Math.min(afrondDag, plan.length); d++) {
    for (const c of plan[d]) { const x = P(c); const r = Engine.speelKaart(st, x.k, { doel: x.doel, optie: x.optie }); totaal++; if (r.ok) speelOk++; }
    if (d < afrondDag - 1 || afrondDag === plan.length) { if (st.dag < st.aantalDagen) Engine.volgendeDag(st); }
  }
  if (afrondDag === plan.length) while (st.dag < st.aantalDagen && R() < 0.5) Engine.volgendeDag(st);
  const u = Engine.rondAf(st);
  const o = oracle(ep, st);
  const echt = u.geschonden.map(x => x.id);
  const ordeVerw = o.ids.slice().sort((a, b) => (ERNST[a] - ERNST[b]) || (dataOrde.indexOf(a) - dataOrde.indexOf(b)));
  let fout = null;
  if (JSON.stringify(echt) !== JSON.stringify(ordeVerw)) fout = "geschonden: verwacht " + JSON.stringify(ordeVerw) + " kreeg " + JSON.stringify(echt);
  else if (u.poortGehaald) {
    const sp = scoreProfiel(ep, st, o);
    const dz = u.score.duurzaamheid, dm = u.score.doelmatigheid, pn = u.profiel && u.profiel.naam;
    if (sp.dz !== dz) fout = "dz verwacht " + sp.dz + " kreeg " + dz; else if (sp.dm !== dm) fout = "dm verwacht " + sp.dm + " kreeg " + dm; else if (sp.profiel !== pn) fout = "profiel verwacht " + sp.profiel + " kreeg " + pn;
    gehaald++;
  } else {
    if (u.score !== null || u.profiel !== null) fout = "score/profiel niet null";
    else if (u.vraag !== u.geschonden[0].vraag) fout = "vraag";
    if (echt.length === 1) enkel[echt[0]] = (enkel[echt[0]] || 0) + 1;
  }
  if (fout) { fouten++; if (voorb.length < 10) voorb.push({ n, fout, tl: st.tijdlijn.map(r => r.dag + ":" + r.kaart + (r.doel ? ">" + r.doel : "") + (r.optie ? ">" + r.optie : "")).join(" "), ab: st.volgordeAB.join(""), geb: st.gebeurtenissen.map(g => g.id + "@" + g.dag).join(","), dag: st.dag }); }
}
console.log(JSON.stringify({ ep, N, gehaald, fouten, speelOk, speelPogingen: totaal, enkel }));
voorb.forEach(v => console.log(JSON.stringify(v)));
