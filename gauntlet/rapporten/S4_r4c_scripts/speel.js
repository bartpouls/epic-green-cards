const L = require("./load.js");
if (!globalThis.Engine) L.laad();
const ORDERS = { AB: 0, BA: 0.99 };
function parse(tok) { const p = tok.split(">"); return { kaart: p[0], doel: p[1] || null, optie: p[2] || null }; }
// steps: "G3", "V6>V8>875/125 mg 2 dd", "|" (volgende dag)
function play(order, steps, opts) {
  opts = opts || {};
  const casus = CASUSSEN[0];
  const st = Engine.nieuwSpel(casus, "E3", { rng: () => ORDERS[order], afrondenPasNaGebeurtenissen: !!opts.pas });
  const log = [];
  for (const s of steps) {
    if (s === "|") { Engine.volgendeDag(st); continue; }
    if (s === "*") { Engine.raadpleeg(st); continue; }
    const k = parse(s);
    const r = Engine.speelKaart(st, k.kaart, { doel: k.doel, optie: k.optie });
    if (!r.ok) { log.push("FOUT bij " + s + ": " + r.fout); if (opts.strict !== false) throw new Error("zet geweigerd: " + s + " -> " + r.fout + " (dag " + st.dag + ")"); }
  }
  let u = null;
  if (!opts.geenAfronden) u = Engine.rondAf(st);
  return { st, u, log };
}
function samenvat(r) {
  const st = r.st, u = r.u;
  return {
    geb: st.gebeurtenissen.map(g => g.id + "@d" + g.dag), volg: st.volgordeAB.join(","),
    klachten: st.klachten.map(k => k && k.status).join(","),
    geschonden: u && u.geschonden.map(g => g.id), poort: u && u.poortGehaald, score: u && u.score, profiel: u && u.profiel && u.profiel.naam,
    extra: u && u.extraVragen.map(x => x.vraag.slice(0, 30)), zicht: u && u.zichtbaar.map(z => z.tekst.slice(0, 30)), vraag: u && u.vraag
  };
}
module.exports = { play, samenvat, ORDERS, parse };
