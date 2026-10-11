// Onafhankelijke oracle (door de criticus geschreven uit casus-uwi.md + bouwopdracht 6.1/6.3/6.5). Leest GEEN data-invarianten.
// Invoer: state (tijdlijn, gebeurtenissen met dag, dag) -> { ids (geschonden, op ernst/volgorde), score, profiel }
const ERNST = { // bouwopdracht 6.1 (1 = ernstigst)
  I12: 1, I5: 2, I10: 2, I15: 2, I9: 3, I16: 3, I14: 3, I13: 3, I7: 3, I6: 4, I11: 4, I8: 4, I1: 5, I3: 5, I4: 5 };
const AB = ["V3", "V4", "V5", "V7", "V8", "V9", "V10"];
const ABE = { E1: ["V3", "V4", "V5"], E2: ["V3", "V4", "V5"], E3: AB };

function oracle(ep, st) {
  const tl = st.tijdlijn.slice().sort((a, b) => a.volg - b.volg);
  const geb = {}; st.gebeurtenissen.forEach(g => geb[g.id] = g.dag);
  const abs = ABE[ep];
  const has = (k, f) => tl.some(r => r.kaart === k && (!f || f(r)));
  const first = (k, f) => tl.find(r => r.kaart === k && (!f || f(r)));
  const startRegels = id => tl.filter(r => r.kaart === id || (r.kaart === "B1" && r.doel === id));
  const gestart = id => startRegels(id).length > 0;
  const startDag = id => startRegels(id)[0].dag;
  // actieve antibiotica na elke regel / einde dag
  function act(maxDag, maxVolg) {
    const a = new Set();
    for (const r of tl) {
      if (maxDag !== undefined && r.dag > maxDag) break;
      if (maxVolg !== undefined && r.volg > maxVolg) break;
      if (r.kaart === "B1") { abs.forEach(x => a.delete(x)); a.add(r.doel); }
      else if (r.kaart === "B2") a.delete(r.doel);
      else if (abs.includes(r.kaart)) a.add(r.kaart);
    }
    return a;
  }
  let maxTegelijk = 0;
  { const a = new Set(); for (const r of tl) { if (r.kaart === "B1") { abs.forEach(x => a.delete(x)); a.add(r.doel); } else if (r.kaart === "B2") a.delete(r.doel); else if (abs.includes(r.kaart)) a.add(r.kaart); maxTegelijk = Math.max(maxTegelijk, a.size); } }
  const wz = (dag, set) => { // werkzaam op dag voor set actieve; toestand van die dag
    const inv = geb.A !== undefined && dag >= geb.A;
    if (ep === "E1") return [...set].some(x => ["V3", "V4", "V5"].includes(x));
    if (ep === "E2") return [...set].some(x => x === "V4");
    if (!inv) return [...set].some(x => x === "V4" || x === "V9");
    return [...set].some(x => x === "V8" || x === "V9" || (x === "V7" && tl.some(r => r.dag <= dag - 1 && (r.kaart === "B4" || (r.kaart === "B3" && r.doel === "calcium")))));
  };
  // klachtenstatus per dag 1..st.dag
  const stat = [null, null];
  { let periodeVoorbij = false; const dA = geb.A;
    for (let d = 2; d <= st.dag; d++) {
      const set = act(d - 1);
      let s;
      if (set.size === 0) s = null; else s = wz(d, set) ? "af" : "aan";
      if (dA !== undefined && d >= dA + 2 && !periodeVoorbij) {
        if (!wz(dA + 1, act(dA + 1)) ) {
          // geen werkzaam einde dA+1 -> geenVerbetering48 tot dag voor de eerste dag waarvan voorgaand dag-einde werkzaam
          if (wz(d, set) && set.size) periodeVoorbij = true; else s = "geenVerbetering48";
        } else periodeVoorbij = true;
      }
      stat[d] = s;
    } }
  const everStat = v => stat.slice(1, st.dag + 1).includes(v);
  const viol = new Set();
  // I1
  if (ep === "E1") { const route = ["V1", "V2", "V3", "V4", "V5"].some(k => has(k)); if (!has("N1") || !route) viol.add("I1"); }
  else if (!has("N1")) viol.add("I1");
  if (ep === "E1" && has("V1") && !has("Ev1")) viol.add("I3");
  if (maxTegelijk > 1) viol.add("I4");
  if (ep === "E2" || ep === "E3") {
    if (gestart("V3")) viol.add("I5");
    // I6: risicogroep
    const eerstAb = tl.find(r => abs.includes(r.kaart));
    const o1 = first("O1");
    if (has("V1") || has("V2") || (eerstAb && !(o1 && o1.volg < eerstAb.volg)) || (ep === "E2" && startRegels("V3").concat(startRegels("V4"), startRegels("V5")).length === 0)) viol.add("I6");
    // I7
    if (gestart("V5")) {
      const s = startDag("V5");
      const o2 = tl.some(r => r.kaart === "O2" && r.dag - s >= 1 && r.dag - s <= 3);
      const v6 = tl.some(r => r.kaart === "V6" && r.doel === "V5" && r.optie === "halveren" && r.dag - s >= 3);
      if (!o2 || !v6) viol.add("I7");
    }
    // I8
    if (geb.C !== undefined) {
      const res = act(geb.C + 1); const resistent = ["V5", "V10"].some(x => res.has(x));
      if (ep === "E2") { if (resistent && everStat("aan")) viol.add("I8"); }
      else { const s = stat[geb.C]; if (resistent && (s === "aan" || s === "geenVerbetering48")) viol.add("I8"); }
    }
  }
  if (ep === "E3") {
    if ((st.volgordeAB, true)) { /* niets */ }
    if ((!has("O2") && !has("Ev2", r => r.doel === "spironolacton")) ||
        (has("B5", r => r.doel === "spironolacton") && !(tl.some(r => r.kaart === "Ev2" && r.doel === "spironolacton" && r.volg < first("B5", x => x.doel === "spironolacton").volg)))) viol.add("I9");
    if (geb.A !== undefined && (act(geb.A).has("V3") || act(geb.A).has("V4"))) viol.add("I10");
    if (geb.A !== undefined) {
      const wissels = tl.filter(r => r.dag >= geb.A && (r.kaart === "B1" || abs.includes(r.kaart)));
      if (wissels.length) { const o = tl.find(r => r.kaart === "O1" && r.dag >= geb.A); if (!(o && o.volg < wissels[0].volg)) viol.add("I11"); }
    }
    if (gestart("V9")) viol.add("I12");
    if (gestart("V8")) { const s = startDag("V8"); if (!tl.some(r => r.kaart === "V6" && r.doel === "V8" && r.optie === "875/125 mg 2 dd" && r.dag === s)) viol.add("I13"); }
    if (gestart("V7")) {
      const sr = startRegels("V7")[0]; const s = sr.dag;
      // calcium actief na start?
      let paused = false; for (const r of tl) { if (r.volg > sr.volg) break; if (r.kaart === "B3" && r.doel === "calcium") paused = true; if (r.kaart === "B5" && r.doel === "calcium") paused = false; }
      if (!paused) { const ok = tl.some(r => (r.kaart === "B4" || (r.kaart === "B3" && r.doel === "calcium")) && r.dag >= s && r.dag <= s + 1); if (!ok) viol.add("I14"); }
    }
    if (geb.B !== undefined) {
      const b = geb.B, w = (k, f) => tl.some(r => r.kaart === k && r.dag >= b && r.dag <= b + 1 && (!f || f(r)));
      if (!(w("B3", r => r.doel === "spironolacton") && w("V6", r => r.doel === "lisinopril" && r.optie === "halveren") && w("N3") && w("Ev1"))) viol.add("I15");
    }
    if (geb.A !== undefined) {
      const a = geb.A;
      const ev1 = tl.some(r => r.kaart === "Ev1" && r.dag >= a && r.dag <= a + 1);
      if (!ev1 || (everStat("geenVerbetering48") && !has("Ev3"))) viol.add("I16");
    }
  }
  const ids = [...viol].sort((x, y) => (ERNST[x] - ERNST[y]));
  return { ids, stat, geb };
}

// score/profiel (6.5), alleen voor gehaalde poort
function scoreProfiel(ep, st, o) {
  const tl = st.tijdlijn.slice().sort((a, b) => a.volg - b.volg);
  const has = k => tl.some(r => r.kaart === k);
  const startRegels = id => tl.filter(r => r.kaart === id || (r.kaart === "B1" && r.doel === id));
  const gestart = id => startRegels(id).length > 0;
  const Vkaarten = ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"];
  if (ep === "E1") {
    const dir = ["V3", "V4", "V5"].some(k => has(k));
    const dz = has("V2") ? 2 : dir ? 1 : has("V1") ? 3 : null;
    let dm = 3 - (has("O1") ? 1 : 0) - (has("O2") ? 1 : 0);
    const profiel = has("V2") ? "Gedeelde regie" : dir ? "Direct behandelen" : has("V1") ? "Terughoudend" : null;
    return { dz, dm: Math.max(1, dm), profiel };
  }
  if (ep === "E2") {
    const onnodig = tl.filter(r => r.kaart === "B1" && o.stat[r.dag] === "af").length;
    const dz = Math.max(1, 3 - onnodig);
    const eerstV = tl.find(r => ["V1", "V2", "V3", "V4", "V5"].includes(r.kaart));
    const g2 = tl.find(r => r.kaart === "G2");
    const dm = g2 && (!eerstV || g2.volg < eerstV.volg) ? 3 : 2;
    const b1 = tl.find(r => r.kaart === "B1");
    const profiel = has("V4") && !b1 ? "Kweekgestuurd, smal" : (has("V5") && b1 && b1.volg > tl.find(r => r.kaart === "V5").volg ? "Bijgestuurd" : null);
    return { dz, dm, profiel };
  }
  const eerstV = tl.find(r => Vkaarten.includes(r.kaart));
  const g3 = tl.find(r => r.kaart === "G3");
  const dm = g3 && (!eerstV || g3.volg < eerstV.volg) ? 3 : 2;
  let dz = null;
  if (gestart("V8") && !gestart("V7")) dz = 3;
  else if (gestart("V7")) { const dC = o.geb.C; const v8 = startRegels("V8"); dz = (dC !== undefined && v8.some(r => r.dag >= dC)) ? 3 : 2; }
  const profiel = gestart("V8") ? "Kweekgestuurd" : gestart("V7") ? "Richtlijn eerste keus" : null;
  return { dz, dm, profiel };
}
module.exports = { oracle, scoreProfiel, ERNST };
