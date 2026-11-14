// Eigen harnas van de CRITICUS: echte data + echte predicaten.js + echte engine.js, eigen mini-evaluator (evaluatie.js bestaat nog niet).
const fs = require("fs"), vm = require("vm");
const root = "/home/user/epic-green-cards/";
function laad(opties) {
  opties = opties || {};
  const sb = { console }; sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
  ["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js", "regels/predicaten.js"].forEach(f => vm.runInContext(fs.readFileSync(root + f, "utf8"), sb, { filename: f }));
  const casus = sb.CASUSSEN[0];
  // SHIM (ronde 1): contract zegt rollen.pauzeer, predicaten.js leest rollen.pauze. Zie rapport.
  // Engine roept Evaluatie.beoordeel aan bij rondAf; wij geven een eigen versie.
  sb.Evaluatie = { beoordeel: (c, id, st) => beoordeel(sb, c, id, st) };
  vm.runInContext(fs.readFileSync(root + "engine/engine.js", "utf8"), sb, { filename: "engine/engine.js" });
  return sb;
}
function geldt(inv, st) {
  return inv.geldtIn.some(g => g === "*" || (typeof g === "string" && st.toestanden.indexOf(g) >= 0) ||
    (g && typeof g === "object" && g.gebeurtenis && st.gebeurtenissen.some(x => x.id === g.gebeurtenis)));
}
function beoordeel(sb, casus, epId, st) {
  const P = sb.Predicaten, ep = casus.episodes.find(e => e.id === epId);
  const ctx = P.maakContext(casus, ep, st);
  const E = x => P.evalueer(x, ctx);
  const geschonden = [];
  ep.invarianten.forEach((inv, idx) => {
    if (!geldt(inv, st)) return;
    if (E(inv.predicaat)) {
      let vraag = inv.vraag;
      (inv.vraagVarianten || []).some(v => { if (E(v.als)) { vraag = v.vraag; return true; } return false; });
      geschonden.push({ id: inv.id, ernst: inv.ernst, vraag, idx });
    }
  });
  geschonden.sort((a, b) => a.ernst - b.ernst || a.idx - b.idx);
  const poort = geschonden.length === 0;
  const eerst = (regels) => { for (const r of regels) if (E(r.als)) return r.punten; return null; };
  const uit = { geschonden, poortGehaald: poort, vraag: poort ? null : geschonden[0].vraag };
  if (poort) {
    uit.score = { duurzaamheid: eerst(ep.score.duurzaamheid.regels), doelmatigheid: eerst(ep.score.doelmatigheid.regels) };
    const pr = ep.profielen.find(p => E(p.als));
    uit.profiel = pr ? { naam: pr.naam, reflectievraag: pr.reflectievraag } : null;
    uit.extra = ep.feedbackExtra.filter(f => E(f.trigger)).map(f => f.vraag);
  }
  uit.zichtbaar = ep.zichtbaarAlsOntbreekt.filter(z => E(z.trigger)).map(z => z.tekst);
  return uit;
}
// route: dagen = array van arrays; kaart = "V4" | ["V6","V8","875/125 mg 2 dd"] | ["B1","V8"]  (doel, optie)
function speel(sb, dagen, o) {
  o = o || {};
  const casus = sb.CASUSSEN[0];
  const st = sb.Engine.nieuwSpel(casus, "E3", { rng: () => (o.volgorde === "BA" ? 0.99 : 0) });
  const log = [];
  for (let d = 0; d < dagen.length; d++) {
    if (d > 0) { if (st.dagenVoorbij) break; sb.Engine.volgendeDag(st); }
    for (const k of dagen[d]) {
      const [id, doel, optie] = Array.isArray(k) ? k : [k];
      if (id === "RAADPLEEG") { const r = sb.Engine.raadpleeg(st); if (!r.ok) throw new Error("raadpleeg: " + r.fout); continue; }
      const r = sb.Engine.speelKaart(st, id, { doel: doel || null, optie: optie || null });
      if (!r.ok) throw new Error("Dag " + (d + 1) + " kaart " + id + " " + (doel || "") + ": " + r.fout);
    }
  }
  const aantalDagen = o.totDag || 7;
  while (!o.vroeg && st.dag < aantalDagen && !st.dagenVoorbij) sb.Engine.volgendeDag(st);
  const uit = sb.Engine.rondAf(st);
  return { st, uit, volgordeAB: st.volgordeAB.join("") };
}
function samenvat(r) {
  const u = r.uit;
  return (u.poortGehaald ? "POORT" : "SCHENDING " + u.geschonden.map(g => g.id).join(",")) + " | AB=" + r.volgordeAB +
    (u.score ? " | score " + JSON.stringify(u.score) + " | profiel " + (u.profiel ? u.profiel.naam : "-") : " | vraag: " + u.vraag) +
    " | ev " + r.st.gebeurtenissen.map(g => g.id + "@" + g.dag).join(",") + " | klachten " + r.st.klachten.map(k => k.status === "af" ? "+" : k.status === "aan" ? "x" : k.status ? "!" : ".").slice(1).join("");
}
module.exports = { laad, speel, samenvat, beoordeel };
