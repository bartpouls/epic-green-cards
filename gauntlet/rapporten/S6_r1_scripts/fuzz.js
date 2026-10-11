const { laad, root } = require("./laad.js");
const { oracle, scoreProfiel, ERNST } = require("./oracle.js");
const opts = {};
if (process.env.MUT) { const m = require(process.env.MUT); Object.assign(opts, m); }
laad(opts);
const casus = CASUSSEN[0];
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const N = +process.argv[3] || 2000, ep = process.argv[2] || "E3", seed0 = +process.argv[4] || 1;
const kaartById = {}; casus.kaarten.forEach(k => kaartById[k.id] = k);
const epd = casus.episodes.find(e => e.id === ep);
const dataOrde = epd.invarianten.map(i => i.id);
// gewichten: sensible kaarten vaker
let fouten = 0, gehaald = 0, totaal = 0; const voorbeelden = [];
const dekking = {}; // invariant -> aantal keren (alleen)  / alleen-enkelvoudig
for (let n = 0; n < N; n++) {
  const R = mulberry(seed0 * 100003 + n);
  const st = Engine.nieuwSpel(casus, ep, { rng: () => R() });
  const maxDagen = 1 + Math.floor(R() * st.aantalDagen);
  const gewenst = Math.floor(R() * (ep === "E3" ? 18 : 10));
  let pogingen = 0;
  // gerichte generatie: kies kaart uit repertoire met bias naar een "script-lijst" voor hogere dekking
  const rep = epd.repertoire;
  while (st.tijdlijn.length < gewenst && pogingen < 400) {
    pogingen++;
    if (R() < 0.12 && st.dag < maxDagen) { Engine.volgendeDag(st); continue; }
    const k = rep[Math.floor(R() * rep.length)];
    const kd = kaartById[k]; const doelen = (kd.doelen && kd.doelen[ep]) || (kd.opties ? Object.keys(kd.opties).map(id => ({ id })) : null);
    let doel = null, optie = null;
    if (doelen) { doel = doelen[Math.floor(R() * doelen.length)].id; if (kd.opties) { const o = kd.opties[doel] || []; if (o.length) optie = o[Math.floor(R() * o.length)].tekst; } }
    const r = Engine.speelKaart(st, k, { doel, optie });
    if (!r.ok && /geen acties/.test(r.fout || "")) { if (st.dag < maxDagen) Engine.volgendeDag(st); else break; }
  }
  // soms doorspelen tot einde
  if (R() < 0.3) while (st.dag < st.aantalDagen) Engine.volgendeDag(st);
  const u = Engine.rondAf(st);
  totaal++;
  const o = oracle(ep, st);
  const echt = u.geschonden.map(x => x.id);
  const ordeEcht = JSON.stringify(echt), ordeVerw = JSON.stringify(o.ids.slice().sort((a, b) => (ERNST[a] - ERNST[b]) || (dataOrde.indexOf(a) - dataOrde.indexOf(b))));
  let fout = null;
  if (ordeEcht !== ordeVerw) fout = "geschonden: verwacht " + ordeVerw + " kreeg " + ordeEcht;
  else if (u.poortGehaald !== (o.ids.length === 0)) fout = "poortGehaald";
  else if (u.poortGehaald) {
    const sp = scoreProfiel(ep, st, o);
    const dz = u.score.duurzaamheid, dm = u.score.doelmatigheid, pn = u.profiel && u.profiel.naam;
    if (sp.dz !== dz) fout = "dz verwacht " + sp.dz + " kreeg " + dz;
    else if (sp.dm !== dm) fout = "dm verwacht " + sp.dm + " kreeg " + dm;
    else if (sp.profiel !== pn) fout = "profiel verwacht " + sp.profiel + " kreeg " + pn;
    gehaald++;
  } else {
    if (u.score !== null || u.profiel !== null) fout = "score/profiel niet null bij schending";
    if (u.vraag !== u.geschonden[0].vraag) fout = "vraag != eerste";
    if (echt.length === 1) dekking[echt[0]] = (dekking[echt[0]] || 0) + 1;
  }
  if (fout) { fouten++; if (voorbeelden.length < 8) voorbeelden.push({ n, fout, tijdlijn: st.tijdlijn.map(r => r.dag + ":" + r.kaart + (r.doel ? ">" + r.doel : "") + (r.optie ? ">" + r.optie : "")).join(" "), ab: st.volgordeAB, geb: st.gebeurtenissen.map(g => g.id + "@" + g.dag).join(","), dag: st.dag, echt, verw: o.ids }); }
}
console.log(JSON.stringify({ ep, totaal, gehaald, fouten, dekkingAlleen: dekking }));
voorbeelden.forEach(v => console.log(JSON.stringify(v)));
